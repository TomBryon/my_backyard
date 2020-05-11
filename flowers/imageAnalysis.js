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
// https://www.ikea.com/au/en/images/products/smycka-artificial-flower__0903311_PE596728_S5.JPG
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

       var res = obj.tags[0].name+"\n"+obj.tags[1].name+"\n"+ obj.tags[2].name;
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
             var imgWidth = img.naturalWidth;
             var screenWidth  = $(window).width() - 20;
             var scaleX = 1;
             if (imgWidth > screenWidth){scaleX = screenWidth/imgWidth;}
             var imgHeight = img.naturalHeight;
             var screenHeight = $(window).height() - canvas.offsetTop-10;
             var scaleY = 1;
             if (imgHeight > screenHeight){scaleY = screenHeight/imgHeight;}
             var scale = scaleY;
             if(scaleX < scaleY){scale = scaleX;}
             if(scale < 1){
               imgHeight = imgHeight*scale;
               imgWidth = imgWidth*scale;
             }
             canvas.height = imgHeight;
             canvas.width = imgWidth;
             ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0,0, imgWidth, imgHeight);
           };
        };
        FR.readAsDataURL( this.files[0] );
    }
}

function up() {
  fileUpload.click();
  fileUpload.onchange = readImage;

}
























$(document).ready(function () {

    //Step 1. Hook into the myFile input file change event



   var subKey = 'd73860db3f5c4ce0b22c77368c26cd54';

    function makeblob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    $('#in').change(function () {

        //Load everything in
        var reader = new FileReader();
        var file = this.files[0];
      //  var mb = $(this).serializeObject();
        console.log(file);
        reader.onload=  function() {
            var resultData = this.result;




        //     console.log(resultData);


            resultData = resultData.split(',')[1];

            processImage(resultData);
           // processImage(mb);
        };


        reader.readAsDataURL(file);

    });

    processImage = function(binaryImage) {




     //   var uriBase = "https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze";
        var uriBase = "https://flowers.cognitiveservices.azure.com/vision/v2.0/analyze";

        //    // Request parameters.
        var params = {
          "visualFeatures": "Tags",
          "details": "",
          "language": "en",
        };

        $.ajax({
            url: "https://flowers.cognitiveservices.azure.com/vision/v2.0/analyze?" + $.param(params),

           method: "POST",
           type: "POST",
            beforeSend: function (xhrObj) {
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subKey);


            },
            contentType: "application/octet-stream",
            mime: "application/octet-stream",
            data: makeblob(binaryImage, 'image/jpeg'),
            cache: false,
            processData: false


        }) .done(function(data) {
           // Show formatted JSON on webpage.
           da = JSON.stringify(data, null, 2);
           var obj = JSON.parse(da);
           daa = JSON.stringify(obj, null, 2);

           var res = obj.tags[0].name+"\n"+obj.tags[1].name+"\n"+ obj.tags[2].name;
           console.log(res)

           // var canvas = document.getElementById("responseTextArea");
           // var ctx = canvas.getContext("2d");
           // ctx.font = "30px sans-serif";
           // ctx.fillStyle = "#548235";
           // ctx.textAlign = "center";

           //ctx.fillText(res, canvas.width/2, canvas.height/2);
           $("#responseTextArea").val(res);

           alert("Success");
         })

    }
});
