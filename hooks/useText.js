const texts = require("../data/texts");

const useTexts = () => {
  const t = (text, data) => {
    return data ? texts[text](data) : texts[text];
  };

  return { t, texts };
};

module.exports = useTexts;
