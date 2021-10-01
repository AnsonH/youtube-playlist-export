export const axiosErrorResponse = (status, reason) => ({
  response: {
    status,
    data: {
      error: {
        code: 404,
        errors: [{ reason }],
      },
    },
  },
});

export const exportItemsDefault = {
  position: true,
  title: true,
  uploader: true,
  uploaderUrl: false,
  url: true,
  description: false,
  videoPrivacy: false,
  publishTime: false,
};
