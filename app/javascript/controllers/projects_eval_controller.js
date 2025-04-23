import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { images: Array, xAxis: String, yAxis: String, withTimer: Boolean, duration: Number }

  connect() {
    this.withTimerValue ? this.startTimedFlow() : this.startClassicFlow()
  }

  startClassicFlow() {
    $(function() {
      for (let i = 0; i < 6; i++) {
        sessionStorage.setItem("x" + i, 0.0);
        new rSlider({
          target: "#slider-x" + i, range: false,
          values: {min: -1.0, max: 1.0}, step: 0.01, set: [0.0],
          labels: false, tooltip: false, scale: null,
          onChange: function (val) {
            $("#val-x" + i).attr("value", val);
            sessionStorage.setItem("x" + i, val);
          }
        });
        sessionStorage.setItem("y" + i, 0.0);
        new rSlider({
          target: "#slider-y" + i, range: false,
          values: {min: -1.0, max: 1.0}, step: 0.01, set: [0.0],
          labels: false, tooltip: false, scale: null,
          onChange: function (val) {
            $("#val-y" + i).attr("value", val);
            sessionStorage.setItem("y" + i, val);
          }
        });
      }

      $("#submit").on('click', function () {
        urls = [];
        for (let i = 0; i < 6; i++) {
          urls.push($("#image-" + i).attr("src"));
          sessionStorage.setItem("i" + i, $("#img-" + i).attr("value"));
        }
        sessionStorage.setItem("URLs", JSON.stringify(urls));
        sessionStorage.setItem("x_label", $("#x_axis-0").text());
        sessionStorage.setItem("y_label", $("#y_axis-0").text());
      });
    });
  }

  startTimedFlow() {
    this.currentImageIndex = 0
    this.results          = []
    this.progressTimer    = null

    this.element.querySelector('#next-button')
      .addEventListener('click', () => this.nextClicked())

    this.showNextImage()
  }

  showNextImage() {
    const imgContainer = $("#image-container");
    const sliderContainer = $("#slider-container");
    sliderContainer.hide();

    imgContainer.html(`
        <img src="${this.imagesValue[this.currentImageIndex].url}"
             class="img-fluid"
             style="width:80vw;max-width:600px;height:auto;object-fit:contain;" />
    `);

    this.stopProgressBar();

    this.progressBar = document.getElementById("progress-bar");
    this.progressBar.parentElement.parentElement.style.display = '';
    this.resetProgressBar();
    this.startProgressBar();

    setTimeout(() => {
      this.stopProgressBar();
      this.resetProgressBar();
      this.progressBar.parentElement.parentElement.style.display = 'none';

      imgContainer.empty();
      this.rebuildSliderHTML();
      sliderContainer.fadeIn(() => {
        this.setupSliders();
      });
    }, this.durationValue);
  }

  startProgressBar() {
    const totalDuration = this.durationValue;
    const updateInterval = 100;
    let elapsed = 0;

    if (!this.progressBar) {
      console.error("Progress bar element not found!");
      return;
    }

    this.progressBar.style.transition = "none";
    this.progressBar.style.width = "100%";

    void this.progressBar.offsetWidth;

    setTimeout(() => {
      this.progressBar.style.transition = "width 0.1s linear";

      this.progressTimer = setInterval(() => {
        elapsed += updateInterval;
        const percent = Math.max(100 - (elapsed / totalDuration) * 100, 0);
        this.progressBar.style.width = `${percent}%`;

        if (elapsed >= totalDuration) {
          clearInterval(this.progressTimer);
          this.progressTimer = null;
        }
      }, updateInterval);
    }, 10);
  }

  resetProgressBar() {
    if (this.progressBar) {
      this.progressBar.style.width = "100%";
    }
  }

  stopProgressBar() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  rebuildSliderHTML() {
    $("#slider-x").html('<div id="slider-x-inner"></div>');
    $("#slider-y").html('<div id="slider-y-inner"></div>');
  }

  setupSliders() {
    if (!document.getElementById('slider-x-inner') || !document.getElementById('slider-y-inner')) {
      console.error("Slider elements not found in DOM!");
      return;
    }

    this.sliderX = new rSlider({
      target: "#slider-x-inner",
      range: false,
      values: { min: -1.0, max: 1.0 },
      step: 0.01,
      set: [0.0],
      labels: false,
      tooltip: false,
      scale: null,
      onChange: val => { this.currentX = parseFloat(val); }
    });

    this.sliderY = new rSlider({
      target: "#slider-y-inner",
      range: false,
      values: { min: -1.0, max: 1.0 },
      step: 0.01,
      set: [0.0],
      labels: false,
      tooltip: false,
      scale: null,
      onChange: val => { this.currentY = parseFloat(val); }
    });

    this.currentX = 0.0;
    this.currentY = 0.0;
  }

  nextClicked() {
    const xVal = this.sliderX ? parseFloat(this.sliderX.getValue()) : 0.0
    const yVal = this.sliderY ? parseFloat(this.sliderY.getValue()) : 0.0

    const image = this.imagesValue[this.currentImageIndex];

    this.results.push({
      id: image.id,
      x: xVal,
      y: yVal
    });

    this.currentImageIndex++;

    if (this.currentImageIndex < this.imagesValue.length) {
      this.destroySliders();
      this.showNextImage();
    } else {
      this.finishEvaluation();
    }
  }

  destroySliders() {
    $("#slider-x").empty();
    $("#slider-y").empty();
    this.currentX = 0.0;
    this.currentY = 0.0;
  }

  finishEvaluation() {
    const urls = this.imagesValue.map(img => img.url);
    sessionStorage.setItem("URLs", JSON.stringify(urls));
    sessionStorage.setItem("x_label", this.xAxisValue);
    sessionStorage.setItem("y_label", this.yAxisValue);

    $("#slider-container").hide();
    $("#submit-container").fadeIn();

    this.results.forEach((result, idx) => {
      $(`#i${idx}`).val(result.id);
      $(`#x${idx}`).val(result.x);
      $(`#y${idx}`).val(result.y);

      sessionStorage.setItem(`i${idx}`, result.id);
      sessionStorage.setItem(`x${idx}`, result.x);
      sessionStorage.setItem(`y${idx}`, result.y);
    });
  }
}
