// Basic JavaScript function to submit an image to the Microsoft Cognitive Services API.
// Note: to get this running, you need a valid subscription key. Also, make sure you
// adapt the URL of the service to match the region where you created it (see the TODO comment).
//
// Microsoft tutorial:
// https://docs.microsoft.com/en-us/azure/cognitive-services/computer-vision/tutorials/javascript-tutorial

// https://www.theflowerweb.com.au/wp-content/uploads/2019/01/single-rose.jpg
// https://images.unsplash.com/photo-1561340928-b1504b04cf03?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60
// https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/close-up-of-yellow-flowering-plant-royalty-free-image-1575667390.jpg?crop=1xw:0.84375xh;center,top&resize=980:*
// https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/flowers-royalty-free-image-997959716-1548454745.jpg?crop=1xw:1xh;center,top&resize=980:*

function analyzeButtonClick() {
    // Retrieve the user-entered value of the image URL
    let sourceImageUrl = $("#inputImage").val();
    // Retrieve the user-entered value of the subscription key
    let subscriptionKey = 'd73860db3f5c4ce0b22c77368c26cd54';
    // Call the processing function, passing the user entered values
    // as well as a reference to the output text area element
    AnalyzeImage(subscriptionKey, sourceImageUrl, $("#responseTextArea"));
}

function AnalyzeImage(subscriptionKey, sourceImageUrl, responseTextArea) {
    // Request parameters
    let params = {
        // Choose categories to analyze - see the documentation for reference
        "visualFeatures": "Tags",
        "details": "",
        "language": "en",
    };

    // ... AJAX call to the Azure Cognitive Service for Computer Vision goes here ...
    $.ajax({
       // TODO: if needed, adapt the URL to the region where you created the service
       url: "https://flowers.cognitiveservices.azure.com/vision/v2.0/analyze?" + $.param(params),
       beforeSend: function(xhrObj){
           // Request the output formatted as JSON
           xhrObj.setRequestHeader("Content-Type","application/json");
           // Send the subscription key as part of the header
           xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
       },
       // Data is submitted to the server through a POST request
       type: "POST",
       // Request body: the image URL
       data: '{"url": ' + '"' + sourceImageUrl + '"}',
   })
   .done(function(data) {
       // Successful request: formate the result JSON in a human-friendly
       // way and output it to the text area HTML element.
       da = JSON.stringify(data, null, 2);
       var obj = JSON.parse(da);
       daa = JSON.stringify(obj, null, 2);

       var res = obj.tags[0].name+", "+obj.tags[1].name+", "+ obj.tags[2].name+", "+ obj.tags[3].name+", "+ obj.tags[4].name;
       console.log(res)

      // var canvas = document.getElementById("responseTextArea");
      // var ctx = canvas.getContext("2d");
      // ctx.font = "30px sans-serif";
      // ctx.fillStyle = "#548235";
      // ctx.textAlign = "center";

       //ctx.fillText(res, canvas.width/2, canvas.height/2);
       responseTextArea.val(res);

       alert("Success");
   })
   .fail(function(jqXHR, textStatus, errorThrown) {
       // Error: print the error message to the text area HTML element.
       responseTextArea.val(JSON.stringify(jqXHR, null, 2));
       alert("Request Failed");
   });
}


var fileUpload = document.getElementById('in');
var canvas  = document.getElementById('fcanvas');
var ctx = canvas.getContext("2d");

function readImage() {
    if ( this.files && this.files[0] ) {
        var FR= new FileReader();
        FR.onload = function(e) {
           var img = new Image();
           img.src = e.target.result;
           img.onload = function() {
             var hRatio = canvas.width  / img.width    ;
             var vRatio =  canvas.height / img.height  ;
             var ratio  = Math.min ( hRatio, vRatio );
             var centerShift_x = ( canvas.width - img.width*ratio ) / 2;
             var centerShift_y = ( canvas.height - img.height*ratio ) / 2;
             ctx.clearRect(0,0,canvas.width, canvas.height);
             ctx.drawImage(img, 0,0, img.width, img.height,
               centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);
             };
        };
        FR.readAsDataURL( this.files[0] );
    }
}

function up() {
  fileUpload.click();
  fileUpload.onchange = readImage;

}
