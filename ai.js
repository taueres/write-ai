import OpenAI from 'openai';
import CryptoJS from 'crypto-js';

const ENCRYPTED = 'U2FsdGVkX1/Rgf7S20j5jwGfmwJMdV4S+UCfHSDaR6I5z0DQgrP82Y/FrR7zim4IV9RiSiDGTmHxQ8k+Q1uqyGfzX+WK4sF4muziEikMPBw=';
const STORAGE_KEY = 'stored_pw';

const readPassword = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const reset = urlParams.get('reset');
    if (reset) {
        window.localStorage.removeItem(STORAGE_KEY);
    }

    let password = window.localStorage.getItem(STORAGE_KEY);
    if (password === null) {
        password = prompt('Password');
    }

    if (password === null) {
        throw new Error('Password is required to access the service.');
    }

    window.localStorage.setItem(STORAGE_KEY, password);

    return password;
}

let openai;
const createClient = () => {
    if (openai) {
        return openai;
    }

    const password = readPassword();
    const decrypted = CryptoJS.AES.decrypt(ENCRYPTED, password);
    const apiKey = decrypted.toString(CryptoJS.enc.Utf8);
    if (!apiKey) {
        throw new Error('ApiKey not available');
    }

    openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
    });

    return openai;
}

export const getSuggestion = async (text) => {
    const openai = createClient();

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                "role": "user",
                "content": `
Predict the next 5 words of the following text. Only return the predicted words, nothing else.

${text}`
            }
        ],
        temperature: 0.5,
        max_tokens: 10,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    const raw = response.choices[0].message.content;
    if (raw.endsWith('.')) {
        return raw.substring(0, raw.length - 1);
    }

    return raw;
}

export const clearPassword = () => {
    window.localStorage.removeItem(STORAGE_KEY);
};
