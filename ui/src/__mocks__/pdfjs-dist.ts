export const getDocument = () => {
  return {
    promise: {
      getPage: () => {
        return {
          getViewport: () => {
            return {
              width: 10,
              height: 10,
            };
          },
          render: () => {
            return {
              promise: false,
            };
          },
        };
      },
    },
  };
};
