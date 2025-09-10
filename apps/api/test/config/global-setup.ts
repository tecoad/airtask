process.env.TZ = 'utc';

process.env.OPENAI_API_KEY = 'invalid-api-key';
process.env.NODE_ENV = 'testing';

jest.setTimeout(600000);
