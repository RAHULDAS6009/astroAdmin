import React from "react";
import SaveContent from "./SaveContent";

const HomePage = () => {
  return (
    <div className="">
      {[
        "About me Para 1 ",
        "About me Para 2",
        "My Philosophy Para",
        "My Blessing Para",
        "Modern Astrology Para About me 1",
        "Modern Astrology Para About me  2",
      ].map((title, key) => {
        return <SaveContent key={key} title={title} />;
      })}
    </div>
  );
};

export default HomePage;
