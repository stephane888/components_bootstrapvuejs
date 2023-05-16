/**
 * Bug: Les plugins sont charger via cette route : /core/assets/vendor/
 * Cela est du au fait que il ya un ckeditor qui est chargé à partir de la. (/core/modules/ckeditor/js/ckeditor.js et /core/assets/vendor/ckeditor/ckeditor.js)
 * ||
 * fgf
 */
import request from "../fieldsDrupal/loadField";
export default {
  preEditorConfig() {
    return {
      codeSnippet_theme: "monokai_sublime",
      stylesSet: [],
      // toolbars configs => https://ckeditor.com/latest/samples/toolbarconfigurator/#advanced
      toolbar: [
        {
          name: "basicstyles",
          items: [
            "Bold",
            "Italic",
            "Underline",
            "Strike",
            "Subscript",
            "Superscript",
            "-",
            "CopyFormatting",
            "RemoveFormat",
          ],
        },
        {
          name: "clipboard",
          items: [
            "Cut",
            "Copy",
            "Paste",
            "PasteText",
            "PasteFromWord",
            "-",
            "Undo",
            "Redo",
          ],
        },
        {
          name: "document",
          items: [
            "Source",
            "-",
            // "Save",
            // "NewPage",
            // "Preview",
            // "Print",
            // "-",
            "Templates",
            "CodeSnippet",
          ],
        },
        // {
        //   name: "editing",
        //   items: ["Find", "Replace", "-", "SelectAll", "-", "Scayt"],
        // },
        // {
        //   name: "forms",
        //   items: [
        //     "Form",
        //     "Checkbox",
        //     "Radio",
        //     "TextField",
        //     "Textarea",
        //     "Select",
        //     "Button",
        //     "ImageButton",
        //     "HiddenField",
        //   ],
        // },
        //"/",

        {
          name: "paragraph",
          items: [
            "NumberedList",
            "BulletedList",
            "-",
            "Outdent",
            "Indent",
            "-",
            "Blockquote",
            "CreateDiv",
            "-",
            "JustifyLeft",
            "JustifyCenter",
            "JustifyRight",
            "JustifyBlock",
            "-",
            // "BidiLtr",
            // "BidiRtl",
            // "Language",
          ],
        },
        { name: "links", items: ["Link", "Unlink", "Anchor"] },
        {
          name: "insert",
          items: [
            "Image",
            "QuickUploaderUpload",
            "Flash",
            "Table",
            "HorizontalRule",
            "Smiley",
            "SpecialChar",
            "PageBreak",
            "Iframe",
          ],
        },
        "/",
        { name: "styles", items: ["Styles", "Format", "Font", "FontSize"] },
        { name: "colors", items: ["TextColor", "BGColor"] },
        { name: "tools", items: ["Maximize", "ShowBlocks"] },
        { name: "about", items: ["About"] },
      ],
      contentsCss: this.getImportCss(),
      on: {
        instanceReady: function (ev) {
          ev.sender.dataProcessor.writer.setRules("p", {
            indent: true,
            breakBeforeOpen: true,
            breakAfterOpen: false,
            breakBeforeClose: true,
            breakAfterClose: true,
          });
          ev.sender.dataProcessor.writer.setRules("img", {
            indent: true,
            breakBeforeOpen: true,
            breakAfterOpen: false,
            breakBeforeClose: false,
            breakAfterClose: false,
          });
          ev.sender.dataProcessor.writer.setRules("h1", {
            indent: true,
            breakBeforeOpen: false,
            breakAfterOpen: false,
            breakBeforeClose: false,
            breakAfterClose: false,
          });

          ev.sender.dataProcessor.writer.setRules("h2", {
            indent: true,
            breakBeforeOpen: false,
            breakAfterOpen: false,
            breakBeforeClose: false,
            breakAfterClose: false,
          });
          ev.sender.dataProcessor.writer.setRules("h3", {
            indent: true,
            breakBeforeOpen: false,
            breakAfterOpen: false,
            breakBeforeClose: false,
            breakAfterClose: false,
          });
          ev.sender.dataProcessor.writer.setRules("h4", {
            indent: true,
            breakBeforeOpen: false,
            breakAfterOpen: false,
            breakBeforeClose: false,
            breakAfterClose: false,
          });
          ev.sender.dataProcessor.writer.setRules("h5", {
            indent: true,
            breakBeforeOpen: false,
            breakAfterOpen: false,
            breakBeforeClose: false,
            breakAfterClose: false,
          });
          ev.sender.dataProcessor.writer.setRules("h6", {
            indent: true,
            breakBeforeOpen: false,
            breakAfterOpen: false,
            breakBeforeClose: false,
            breakAfterClose: false,
          });
          ev.sender.dataProcessor.writer.setRules("div", {
            indent: true,
            breakBeforeOpen: true,
            breakAfterOpen: true,
            breakBeforeClose: true,
            breakAfterClose: false,
          });
        },
      },
    };
  },
  onNamespaceLoaded(CKEDITOR) {
    // pour empecher ckeditor d'ajouter '<p>'
    CKEDITOR.config.enterMode = CKEDITOR.ENTER_BR;
    //
    CKEDITOR.config.allowedContent = true;
    // CKEDITOR.config.contentsCss =
    // "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
    CKEDITOR.config.htmlEncodeOutput = false;
    CKEDITOR.config.entities = false;
    // CKEDITOR.config.entities_processNumerical = 'force';
    CKEDITOR.dtd.$removeEmpty.span = 0;
    CKEDITOR.dtd.$removeEmpty.i = 0;
    CKEDITOR.dtd.$removeEmpty.label = 0;
    // quickuploader
    // Pas necessaire on a opté d'ajouter le module dans ckeditor au niveau du theme wb-universe/ckeditor.
    // const date = new Date();
    // CKEDITOR.plugins.addExternal(
    //   "quickuploader",
    //   request.config.getBaseUrl() +
    //     "/libraries/quickuploader/plugin.js?v=" +
    //     date.getTime()
    // );
    // humm.
    if (request.config)
      CKEDITOR.config.quickuploaderUploadUrl = request.config.getBaseUrl();
  },
  // Le parent surchargera cette partie enfin de fournir ces styles.
  /**
   * example in parent : 
   * ckeditorConfig.getImportCss = function () {
        return (
          "@import '" +
          request.getBaseUrl() +
          "/themes/contrib/wb_universe/node_modules/%40fortawesome/fontawesome-free/css/all.min.css'; @import 'https://wb-horizon.com/themes/custom/wb_horizon_com/css/vendor-style.css'; "
        );
      };
   * @returns 
   */
  getImportCss() {
    return "";
  },
  /**
   *  editor-url="https://cdn.ckeditor.com/4.20.1/standard/ckeditor.js" permet de specifier l'url externe.
 NB: Dans la mesure ou la page dispose deja de ckeditor, le module ne chargera plus le CDN, il va utiliser celui qui est present.
 Consequence, les plugins peuvent ne plus fonctionner sauf s'ils sont definie dans le nouveau plugin.
***
 Vous pouvez egalment utiliser le plugins local qui se trouve dans /themes/contrib/wb_universe/ckeditor/ckeditor.js" via cet attributes
 editor-url="/themes/contrib/wb_universe/ckeditor/ckeditor.js".
( pour pallier à ce probleme de ck-editor on va desactivée le module c )
***
   * @returns 
   */
  editorUrl() {
    //return "https://cdn.ckeditor.com/4.20.1/standard/ckeditor.js";
    const urlEdit =
      request.config.getBaseUrl() +
      "/themes/contrib/wb_universe/ckeditor/ckeditor.js";
    console.log("urlEdit : ", urlEdit);
    return urlEdit;
  },
};
