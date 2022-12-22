/**
 * https://plnkr.co/edit/zYSBv9zIaLpa3rQr?p=preview&preview
 * https://javascript.info/mouse-drag-and-drop
 * https://www.javascripttutorial.net/web-apis/javascript-drag-and-drop/
 */

class DragAndDrop {
  constructor(items, options = {}) {
    this.items = items;
    this.options = this.mergeOptions(options);
    this.dragSrcEl = null;
    this.oldIndex = null;
    this.newIndex = null;
  }
  sortable() {
    const items = this.items;
    var self = this;
    const custom_class = ["border", "border-success", "shadow"];
    function emit_data() {
      if (self.oldIndex !== null && self.newIndex !== null) {
        const event = new CustomEvent(self.options.event_name, {
          detail: {
            oldIndex: self.oldIndex,
            newIndex: self.newIndex,
          },
        });
        document.dispatchEvent(event);
      }
    }
    const move = (arr, old_index, new_index) => {
      while (old_index < 0) {
        old_index += arr.length;
      }
      while (new_index < 0) {
        new_index += arr.length;
      }
      if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
          arr.push(undefined);
        }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    };
    function getDomIndex(target) {
      return [].slice.call(target.parentNode.children).indexOf(target);
    }
    function handleDragStart(e) {
      // à chaque nouveau deplacement on remet les indices à null.
      self.oldIndex = null;
      self.newIndex = null;
      //
      self.oldIndex = getDomIndex(this);
      this.style.opacity = "0.5";
      self.dragSrcEl = this;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", this.innerHTML);
    }
    function handleDragEnd(e) {
      this.style.opacity = "1";
      for (const item of items.children) {
        item.classList.remove(...custom_class);
      }
    }
    function handleDragOver(e) {
      e.preventDefault();
      this.classList.add(...custom_class);
      return false;
    }

    function handleDragEnter(e) {
      //this.classList.add(...custom_class);
    }

    function handleDragLeave(e) {
      this.classList.remove(...custom_class);
    }
    function handleDrop(e) {
      e.stopPropagation(); // stops the browser from redirecting.
      if (self.dragSrcEl !== this) {
        self.newIndex = getDomIndex(this);
        if (self.options.moveHtml) {
          self.dragSrcEl.innerHTML = this.innerHTML;
          this.innerHTML = e.dataTransfer.getData("text/html");
        }
        emit_data();
      }
      return false;
    }
    for (const item of items.children) {
      item.addEventListener("dragstart", handleDragStart);
      item.addEventListener("dragover", handleDragOver);
      item.addEventListener("dragenter", handleDragEnter);
      item.addEventListener("dragleave", handleDragLeave);
      item.addEventListener("dragend", handleDragEnd);
      item.addEventListener("drop", handleDrop);
      item.setAttribute("draggable", true);
    }
  }
  destroyed() {
    const items = this.items;
    function handleDragStart() {
      //
    }
    function handleDragOver() {
      //
    }
    function handleDragEnter() {
      //
    }
    function handleDragLeave() {
      //
    }
    function handleDragEnd() {
      //
    }
    function handleDrop() {
      //
    }
    for (const item of items.children) {
      item.removeEventListener("dragstart", handleDragStart);
      item.removeEventListener("dragover", handleDragOver);
      item.removeEventListener("dragenter", handleDragEnter);
      item.removeEventListener("dragleave", handleDragLeave);
      item.removeEventListener("dragend", handleDragEnd);
      item.removeEventListener("drop", handleDrop);
      item.setAttribute("draggable", false);
    }
  }

  defaultOptions() {
    return {
      event_name: "drap-drop-html5", // à utiliser si on a plus d'une liste, car chaque evenement doit emettre son propre evenement.
    };
  }

  mergeOptions(OverridesOptions) {
    const options = this.defaultOptions();
    for (const i in options) {
      if (OverridesOptions[i]) {
        options[i] = OverridesOptions[i];
      }
    }
    return options;
  }
}

//
export default DragAndDrop;
