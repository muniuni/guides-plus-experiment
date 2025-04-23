import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["checkbox", "durationRow"]

  connect() {
    this.toggle()
  }

  toggle() {
    this.durationRowTarget.style.display =
      this.checkboxTarget.checked ? "" : "none"
  }
}