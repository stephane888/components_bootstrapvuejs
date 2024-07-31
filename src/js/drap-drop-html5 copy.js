/**
 * https://plnkr.co/edit/zYSBv9zIaLpa3rQr?p=preview&preview
 * https://javascript.info/mouse-drag-and-drop
 * https://www.javascripttutorial.net/web-apis/javascript-drag-and-drop/
 */

class Rectangle {
  constructor(items, options = {}) {
    this.height = height;
    this.width = width;
  }
}

//
export default {
  /**
   * Options par defaut.
   */
  options: {
    moveHtml: false, // par defaut on modifie les données du arrays afin de suivre les positions.
  },
  dragSrcEl: null,
  oldIndex: null,
  newIndex: null,
  sortable(items, options = {}) {
    const custom_class = ["border", "border-success", "shadow"];
    var self = this;
    function emit_data() {
      const event = new CustomEvent("drap-drop-html5", {
        detail: {
          oldIndex: self.oldIndex,
          newIndex: self.newIndex,
        },
      });
      document.dispatchEvent(event);
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
      console.log("item : ", item);
      item.addEventListener("dragstart", handleDragStart);
      item.addEventListener("dragover", handleDragOver);
      item.addEventListener("dragenter", handleDragEnter);
      item.addEventListener("dragleave", handleDragLeave);
      item.addEventListener("dragend", handleDragEnd);
      item.addEventListener("drop", handleDrop);
    }
  },
};
