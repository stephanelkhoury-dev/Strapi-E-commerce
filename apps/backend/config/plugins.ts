export default ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
      register: {
        allowedFields: ['firstName', 'lastName'],
      },
    },
  },
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY', ''),
      },
      settings: {
        defaultFrom: env('EMAIL_DEFAULT_FROM', 'noreply@yourstore.com'),
        defaultReplyTo: env('EMAIL_DEFAULT_REPLY_TO', 'support@yourstore.com'),
      },
    },
  },
});
