# styleLess

Parses LESS, beautifies LESS then writes LESS all using LESS.js

## Synopsis

__Warning__ this is opionionated formatting, as it compresses lines that take up 
less than 81 chars into one line to be more concise.

```less

/* Comments before rule */
.navbar {
  background-color: black;
  color: #fff;
  height: 23px;
  -moz-transition-duration: 1337ms;
  width: ~`@{document.body.clientWidth}`;
  @desired-menu-width: 950px;

  a:link, a:visited { color: #dadada; }

  .nav-main {
    /* calls to mixins */
    .grid(24, 14);

    /* Inline mixin declarations */
    .right-separator() { border-right: 1px solid #949494; }

    /* Literal escaped values */
    filter: ~"progid:DXImageTransform.Microsoft.Alpha(Opacity=89)";

    /* Literal quoted values */
    font-family: "Trebuchet MS";

    li { &:first-child { margin: 0; } }

    > li.submenu > a:link, > li.submenu > a:visited {
      background: url('icons/arrow-down.png') 23px 23px no-repeat transparent;
      .right-separator;
    }

    // Keep Me
    .preview-label { width: 100px; display: block; font-size: small; }

    li a:hover, li a:active, li.current a:link,
    li.current a:visited, li.submenu a:link, li.submenu a:visited {
      .menublock {
        opacity: 1;
        padding: 10px ((@desired-menu-width - 100px) / 2);
      }
    }
  }

  /* 
   * Comments after rule
   */
}

/* Comments between root rules */
#main { .link { color: white; font-weight: bold; text-decoration: underline; } }

```

## Installation

    npm install style-less

## Usage

  style-less ugly.less > pretty.less




