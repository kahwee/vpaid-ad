/**
 * Creates link element and places it into the body in order to load CSS
 * @param  {string} url URL of the CSS to load
 * @return {DOM}        <link> itself
 */
export default function (url) {
  let link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  // parent returns Window object
  parent.document.body.appendChild(link);
  return link;
}