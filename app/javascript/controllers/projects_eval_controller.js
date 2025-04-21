import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { images: Array, xAxis: String, yAxis: String }

  connect() {
    this.currentImageIndex = 0;
    this.xValues = [];
    this.yValues = [];

    $("#next-button").on('click', () => this.nextClicked());
    this.showNextImage();
  }

  showNextImage() {
    const imgContainer = $("#image-container");
    const sliderContainer = $("#slider-container");
    sliderContainer.hide();
    imgContainer.html(`<img src="${this.imagesValue[this.currentImageIndex].url}" class="col-12" />`);

    setTimeout(() => {
      imgContainer.empty();
      sliderContainer.fadeIn(() => {
        // Sliders initialized here, once container is visible
        this.setupSliders();
      });
    }, 5000);
  }

  setupSliders() {
    this.sliderX = new rSlider({
      target: "#slider-x",
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
      target: "#slider-y",
      range: false,
      values: { min: -1.0, max: 1.0 },
      step: 0.01,
      set: [0.0],
      labels: false,
      tooltip: false,
      scale: null,
      onChange: val => { this.currentY = parseFloat(val); }
    });
  }

  nextClicked() {
    this.xValues.push(this.currentX ?? 0.0);
    this.yValues.push(this.currentY ?? 0.0);

    this.currentImageIndex++;

    if (this.currentImageIndex < this.imagesValue.length) {
      this.destroySliders();  // Destroy current sliders before reinitializing
      this.showNextImage();
    } else {
      this.finishEvaluation();
    }
  }

  destroySliders() {
    // Remove slider DOM elements completely to avoid reinitialization issues
    $("#slider-x").html("");
    $("#slider-y").html("");
    this.currentX = 0.0;
    this.currentY = 0.0;
  }

  finishEvaluation() {
    $("#slider-container").hide();
    $("#submit-container").fadeIn();

    $("#x_values").val(JSON.stringify(this.xValues));
    $("#y_values").val(JSON.stringify(this.yValues));
  }
}


// import { Controller } from "@hotwired/stimulus"
//
// // Connects to data-controller="projects-eval"
// export default class extends Controller {
//   connect() {
//     $(function() {
//       for (let i = 0; i < 6; i++) {
//         sessionStorage.setItem("x"+i, 0.0);
//         new rSlider({
//                target: "#slider-x"+i, range: false,
//                values: {min: -1.0, max: 1.0}, step:0.01, set: [0.0],
//                labels: false, tooltip: false, scale: null,
//                onChange: function(val) {
//                       $("#val-x"+i).attr("value", val);
//                       sessionStorage.setItem("x"+i, val);
//                     } });
//         sessionStorage.setItem("y"+i, 0.0);
//         new rSlider({
//                target: "#slider-y"+i, range: false,
//                values: {min: -1.0, max: 1.0}, step:0.01, set: [0.0],
//                labels: false, tooltip: false, scale: null,
//                onChange: function(val) {
//                       $("#val-y"+i).attr("value", val);
//                       sessionStorage.setItem("y"+i, val);
//                     } });
//       }
//
//       $("#submit").on('click', function() {
//           urls = [];
//           for (let i = 0; i < 6; i++) {
//             urls.push($("#image-"+i).attr("src"));
//             sessionStorage.setItem("i"+i, $("#img-"+i).attr("value"));
//           }
//           sessionStorage.setItem("URLs", JSON.stringify(urls));
//           sessionStorage.setItem("x_label", $("#x_axis-0").text());
//           sessionStorage.setItem("y_label", $("#y_axis-0").text());
//       });
//     });
//   }
// }
