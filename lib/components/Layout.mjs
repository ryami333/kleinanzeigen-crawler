import { createElement } from "react";

/**
 * @param {{ children: React.ReactNode }} props
 */
export const Layout = ({ children }) =>
  createElement(
    "html",
    null,
    createElement(
      "head",
      null,
      createElement("meta", { charSet: "utf-8" }),
      createElement("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      }),
      createElement("link", {
        rel: "stylesheet",
        href: "https://unpkg.com/@mantine/core@7.4.2/styles.css",
      }),
    ),
    createElement("body", null, children),
  );
