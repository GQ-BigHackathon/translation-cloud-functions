(async () => {
  // A helper function to store data in JSON format on localstorage.
  const storeData = (key, value) => {
    const appData = localStorage.getItem('translationApp')
      ? JSON.parse(localStorage.getItem('translationApp'))
      : {};
    appData[key] = value;
    localStorage.setItem('translationApp', JSON.stringify(appData));
  };

  // A helper function to get data from localstorage.
  const getData = (key) => {
    const appData = localStorage.getItem('translationApp')
      ? JSON.parse(localStorage.getItem('translationApp'))
      : {};
    return appData[key];
  };

  const translatePageBody = async () => {
    // Check if the element is visible
    const visibleAndHasTextNode = (element) => {
      const style = getComputedStyle(element);
      if (style.display === 'none') return false;
      return Array.from(element.childNodes).find(
        (node) => node.nodeType === 3 && node.textContent.trim().length > 1,
      );
    };

    // Creates a path we can target later on to ensure we get the correct element
    const createXPathFromElement = (elm) => {
      const allNodes = document.getElementsByTagName('*');
      for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
        if (elm.hasAttribute('id')) {
          let uniqueIdCount = 0;
          for (let n = 0; n < allNodes.length; n++) {
            if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id)
              uniqueIdCount++;
            if (uniqueIdCount > 1) break;
          }
          if (uniqueIdCount == 1) {
            segs.unshift('id("' + elm.getAttribute('id') + '")');
            return segs.join('/');
          } else {
            segs.unshift(
              elm.localName.toLowerCase() +
                '[@id="' +
                elm.getAttribute('id') +
                '"]',
            );
          }
        } else if (elm.hasAttribute('class')) {
          segs.unshift(
            elm.localName.toLowerCase() +
              '[@class="' +
              elm.getAttribute('class') +
              '"]',
          );
        } else {
          for (
            i = 1, sib = elm.previousSibling;
            sib;
            sib = sib.previousSibling
          ) {
            if (sib.localName == elm.localName) i++;
          }
          segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
        }
      }
      return segs.length ? '/' + segs.join('/') : null;
    };

    // decodes the xpath into elements
    const elementsFromXPath = (path) => {
      var xpath = document.evaluate(
        path,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null,
      );
      var temp = [];
      for (var i = xpath.snapshotLength - 1; i >= 0; i--) {
        temp.push(xpath.snapshotItem(i));
      }
      return temp;
    };

    // Gets the exact element from the xpath
    const getElementFromXPath = (path, innerHtml) => {
      return (
        Array.from(elementsFromXPath(path)).find(
          (e) => e.innerHTML === innerHtml,
        ) ||
        Array.from(elementsFromXPath(path)).find(
          (e) =>
            e.innerText.toLowerCase() ===
            innerHtml.replace(/\n/g, '').trim().toLowerCase(),
        )
      );
    };

    // Fetch the translation data from the BE
    const fetchTranslations = async (translations) => {
      return await fetch(
        'https://translation-cloud-functions.vercel.app/translate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            StoreHash: '{{settings.store_hash}}',
          },
          body: JSON.stringify(translations),
        },
      ).then((res) => res.json());
    };

    // Grab the body of the page and check if its visible
    const visibleElementsWithText = Array.from(
      document.body.querySelectorAll('*'),
    ).filter(visibleAndHasTextNode);
    // Mapping the element data for translation
    const elementData = visibleElementsWithText.map((element) => {
      const text = element.textContent;
      const style = getComputedStyle(element);
      const path = createXPathFromElement(element);
      return { element, text, style, path };
    });

    const translationRequestBody = {
      to: getData('translationLanguage').code,
      from: getData('defaultLanguage').code,
      translate: elementData.map((e) => {
        return {
          text: e.text,
          id: e.path,
        };
      }),
    };

    const translationResponse = await fetchTranslations(translationRequestBody);

    // Replace the text with the translation
    translationResponse.translations.forEach((t) => {
      const element = getElementFromXPath(t.id, t.fromText);
      if (element) {
        element.innerHTML = t.toText;
      }
    });
  };

  // A helper function to check if translations are needed.
  const enableTranslationsCheck = (defaultLanguage, translationLanguage) => {
    if (defaultLanguage.code === translationLanguage.code) {
      storeData('translationsEnabled', false);
      return;
    }
    storeData('translationsEnabled', true);
  };

  // onSelection from the dropdown menu.
  const onSelectTranslation = (translation) => {
    const oldLanguage = getData('translationLanguage');
    let willRefresh = false;

    if (translation.code === getData('defaultLanguage').code)
      willRefresh = true; // Reset so we have the base language again.

    if (oldLanguage.code !== getData('defaultLanguage').code)
      willRefresh = true; // We want to translate the base language to the new language.

    //save the translation to localStorage
    storeData('translationLanguage', translation);
    //set the flag to the country code
    const translationFlagBtn = document
      .querySelector('#translation-button')
      .querySelector('span');

    //remove any classes that start with fi-
    translationFlagBtn.classList.forEach((className) => {
      if (className.startsWith('fi-')) {
        translationFlagBtn.classList.remove(className);
      }
    });
    //add the class for the selected country
    translationFlagBtn.classList.add(
      `fi-${languageCodeToCountryCode(translation.code)}`,
    );
    enableTranslationsCheck(getData('defaultLanguage'), translation);
    if (willRefresh) {
      window.location.reload();
      return;
    }
  };

  //Get the list of translations enabled for the store
  const fetchTranslationsEnabled = async () => {
    return await fetch(
      'https://translation-cloud-functions.vercel.app/store/languages',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          StoreHash: '{{settings.store_hash}}',
        },
      },
    ).then((res) => res.json());
  };

  // Really silly function to handle english, and possibly other languages.
  const languageCodeToCountryCode = (languageCode) => {
    switch (languageCode) {
      case 'en':
        return 'gb';
      default:
        return languageCode;
    }
  };

  // Grab the list of translations enabled for the store.
  const storeTranslationData = await fetchTranslationsEnabled();
  if (!storeTranslationData || storeTranslationData.meta.status !== 'success') {
    console.error('error', storeTranslationData.error);
    return;
  }

  const { languagesEnabled, defaultLanguage } = storeTranslationData;

  //store the default language
  storeData('defaultLanguage', defaultLanguage);

  // Import the flag library
  const head = document.getElementsByTagName('head')[0];
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.type = 'text/css';
  cssLink.href = 'https://unpkg.com/flag-icons@6.6.6/css/flag-icons.css'; // This is the flags used by BigDesign
  head.appendChild(cssLink);

  // Grab the nav bar
  const navUserSection = document.querySelector('ul.navUser-section--alt');

  // Create a nav bar item to stick everything inside
  const navUserItem = document.createElement('li');
  navUserItem.classList.add('navUser-item');
  // create a select drop down
  const select = document.createElement('select');
  select.id = 'translation-select';
  select.style.textTransform = 'capitalize';
  select.classList.add('select');
  select.onchange = (e) => {
    onSelectTranslation({
      name: Array.from(e.target.childNodes).find(
        (f) => f.value === e.target.value,
      ).innerText,
      code: e.target.value,
    });
  };

  // First option should be the default
  const option = document.createElement('option');
  option.value = defaultLanguage.code;
  option.innerText =
    defaultLanguage.name[0].toUpperCase() + defaultLanguage.name.substring(1); //lolz;
  select.appendChild(option);

  // Add the other translation options
  languagesEnabled.forEach((language) => {
    const option = document.createElement('option');
    option.value = language.code;
    option.innerText =
      language.name[0].toUpperCase() + language.name.substring(1); //double lolz

    option.selected = getData('translationLanguage')
      ? language.code === getData('translationLanguage').code
      : false;
    select.appendChild(option);
  });

  // Create a button to show the flag
  const button = document.createElement('button');
  button.classList.add('navUser-button');
  button.id = 'translation-button';

  const defaultFlagCode = getData('translationLanguage')
    ? getData('translationLanguage').code
    : defaultLanguage.code;

  button.innerHTML = `<span class="fi fi-${languageCodeToCountryCode(
    defaultFlagCode,
  )}"></span>`;
  button.style.padding = '1rem .78571rem';

  const translationDiv = document.createElement('div');
  translationDiv.id = 'translation-div';
  translationDiv.style.display = 'flex';

  // Lets put it all together
  translationDiv.appendChild(button);
  translationDiv.appendChild(select);

  navUserItem.appendChild(translationDiv);

  navUserSection.insertBefore(navUserItem, navUserSection.firstChild);

  if (getData('translationsEnabled')) {
    translatePageBody();
  }
})();
