type MessageResponse = {
  message: string;
};

type VerifyOtpResponse = {
  verified: true;
  reset_id: string;
};

export { type MessageResponse, type VerifyOtpResponse };
