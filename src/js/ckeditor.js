// The editor creator to use.
import ClassicEditorBase from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";

import Essentials from "@ckeditor/ckeditor5-essentials";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import List from "@ckeditor/ckeditor5-list";
//import List from "@ckeditor/ckeditor5-list/src/list";

import Alignment from "@ckeditor/ckeditor5-alignment"; // <--- ADDED

export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.

ClassicEditor.builtinPlugins = [
  Essentials,
  Bold,
  Italic,
  Image,
  List,
  Alignment, // <--- ADDED
];

// Editor configuration.
ClassicEditor.defaultConfig = {
  toolbar: {
    items: [
      "heading",
      "|",
      "alignment", // <--- ADDED
      "bold",
      "italic",
      "link",
      "bulletedList",
      "numberedList",
      "uploadImage",
      "blockQuote",
      "undo",
      "redo",
    ],
  },
  image: {
    toolbar: [
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",
      "|",
      "toggleImageCaption",
      "imageTextAlternative",
    ],
  },
  // This value must be kept in sync with the language defined in webpack.config.js.
  language: "en",
};
