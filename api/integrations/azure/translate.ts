import { azureTranslate } from '../../../config';
import { http } from '../../../lib/helpers/http';

const translateFn = http(['POST'], async (req, res) => {
  try {
    const translateClient = azureTranslate;

    const { body }: { body: TranslationRequestBody } = req;
    if (!body) throw new Error('No body specified');
    const { from, to, translate } = body;

    // If translate.ids are not unique, the API will return an error.
    // const ids = translate.map(({ id }) => id);
    // if (ids.length !== new Set(ids).size) {
    //   throw new Error('Duplicate ids');
    // }

    // if to is not specified, the API will return an error.
    if (!to) throw new Error('To is not specified');

    // if translate length is 0, the API will return an error.
    if (translate.length === 0) throw new Error('No translations requested');

    const translateResponse = await translateClient.translateStrings(
      translate.map((t) => ({ text: t.text })),
      to,
      from,
    );

    if (!translateResponse) throw new Error('Translate API - No response');
    //extract the translations.text from the response and return it.
    const translationStrings = translateResponse.map(
      (t) => t.translations[0].text,
    );

    const translationsResBody = translate.map((t, index) => {
      const translatedString = translationStrings[index];
      return {
        fromText: t.text,
        toText: translatedString,
        id: t.id,
      };
    });

    const response = {
      translations: translationsResBody,
      meta: {
        status: 'success',
        from: from || 'en',
        to: to,
      },
    };

    res.status(200).json(response);

    return;
  } catch (error: any) {
    console.error('error', error);
    res.status(500).send({ Error: error.message });
    return;
  }
});

export default translateFn;
interface TranslationRequestBody {
  to: string;
  from?: string;
  translate: TranslationBody[];
}

interface TranslationBody {
  text: string;
  id?: string;
}
