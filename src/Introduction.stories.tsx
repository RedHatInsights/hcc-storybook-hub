import React from "react";

export default {
  title: "Introduction",
};

export const Welcome = () => (
  <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: 640 }}>
    <h1>HCC Storybooks</h1>
    <p>
      This is a composed meta Storybook that aggregates stories from multiple
      HCC frontend applications. Expand any project in the sidebar to browse its
      stories.
    </p>
    <p>
      All external Storybooks are loaded from their latest master/main build on
      Chromatic.
    </p>
  </div>
);
