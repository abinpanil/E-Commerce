// Start upload preview image
$(".gambar").attr("src", "https://user.gadjian.com/static/images/personnel_boy.png");
var $uploadCrop,
    tempFilename,
    rawImg,
    imageId;
function readFile(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('.upload-demo').addClass('ready');
            $('#cropImagePop').modal('show');
            rawImg = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
    else {
        swal("Sorry - you're browser doesn't support the FileReader API");
    }
}

$uploadCrop = $('#upload-demo').croppie({
    viewport: {
        width: 150,
        height: 200,
    },
    enforceBoundary: false,
    enableExif: true
});
$('#cropImagePop').on('shown.bs.modal', function () {
    // alert('Shown pop');
    $uploadCrop.croppie('bind', {
        url: rawImg
    }).then(function () {
        console.log('jQuery bind complete');
    });
});

$('.item-img').on('change', function () {
    imageId = $(this).data('id'); tempFilename = $(this).val();
    $('#cancelCropBtn').data('id', imageId); readFile(this);
});
$('#cropImageBtn').on('click', function (ev) {
    $uploadCrop.croppie('result', {
        type: 'base64',
        format: 'jpeg',
        size: { width: 150, height: 200 }
    }).then(function (resp) {
        $('#item-img-output').attr('src', resp);
        $('#cropImagePop').modal('hide');
    });
});
// End upload preview image


// crop Image
$('document').ready(function () {
        //modal1 and image 1
        var image1 = document.getElementById('sampleImage1');
        var modal1 = $('#modal1');
        var cropper1;

        $('#image1').change(function (event) {
            var files = event.target.files;

            var done = function (url) {
                image1.src = url;
                modal1.modal('show');
            };

            if (files && files.length > 0) {
                reader = new FileReader();
                reader.onload = function (event) {
                    done(reader.result);
                };
                reader.readAsDataURL(files[0]);
            }
        });

        modal1.on('shown.bs.modal', function () {
            cropper1 = new Cropper(image1, {
                aspectRatio: 1,
                viewMode: 7,
                preview: '#preview1'
            });
        }).on('hidden.bs.modal', function () {
            cropper1.destroy();
            cropper1 = null;
        });

        $('#crop1').click(function () {
            canvas = cropper1.getCroppedCanvas({
                width: 400,
                height: 400
            });

            canvas.toBlob(function (blob) {
                url = URL.createObjectURL(blob);
                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                    var base64data = reader.result;
                    modal1.modal('hide');
                    $("#imageValue1").val(base64data)
                    $('#chekPreview1').attr('src', base64data);
                };
            });
        });
        //modal1 and image 1 end

        //modal2 and image 2
        var image2 = document.getElementById('sampleImage2');
        var modal2 = $('#modal2');
        var cropper2;

        $('#image2').change(function (event) {
            var files = event.target.files;

            var done = function (url) {
                image2.src = url;
                modal2.modal('show');
            };

            if (files && files.length > 0) {
                reader = new FileReader();
                reader.onload = function (event) {
                    done(reader.result);
                };
                reader.readAsDataURL(files[0]);
            }
        });

        modal2.on('shown.bs.modal', function () {
            cropper2 = new Cropper(image2, {
                aspectRatio: 1,
                viewMode: 2,
                preview: '#preview2'
            });
        }).on('hidden.bs.modal', function () {
            cropper2.destroy();
            cropper2 = null;
        });

        $('#crop2').click(function () {
            canvas = cropper2.getCroppedCanvas({
                width: 200,
                height: 200
            });

            canvas.toBlob(function (blob) {
                url = URL.createObjectURL(blob);
                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                    var base64data = reader.result;
                    modal2.modal('hide');
                    $("#imageValue2").val(base64data)
                    $('#chekPreview2').attr('src', base64data);
                };
            });
        });
        //image 2 and modal 2 end


        //modal3 and image 3 start
        var image3 = document.getElementById('sampleImage3');
        var modal3 = $('#modal3');
        var cropper3;

        $('#image3').change(function (event) {
            var files = event.target.files;

            var done = function (url) {
                image3.src = url;
                modal3.modal('show');
            };

            if (files && files.length > 0) {
                reader = new FileReader();
                reader.onload = function (event) {
                    done(reader.result);
                };
                reader.readAsDataURL(files[0]);
            }
        });

        modal3.on('shown.bs.modal', function () {
            cropper3 = new Cropper(image3, {
                aspectRatio: 1,
                viewMode: 2,
                preview: '#preview3'
            });
        }).on('hidden.bs.modal', function () {
            cropper3.destroy();
            cropper3 = null;
        });

        $('#crop3').click(function () {
            canvas = cropper3.getCroppedCanvas({
                width: 200,
                height: 200
            });

            canvas.toBlob(function (blob) {
                url = URL.createObjectURL(blob);
                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                    var base64data = reader.result;
                    modal3.modal('hide');
                    $("#imageValue3").val(base64data)
                    $('#chekPreview3').attr('src', base64data);
                };
            });
        });
        //image 3 and modal 3 end

        //modal4 and image 4 start
        var image4 = document.getElementById('sampleImage4');
        var modal4 = $('#modal4');
        var cropper4;

        $('#image4').change(function (event) {
            var files = event.target.files;

            var done = function (url) {
                image4.src = url;
                modal4.modal('show');
            };

            if (files && files.length > 0) {
                reader = new FileReader();
                reader.onload = function (event) {
                    done(reader.result);
                };
                reader.readAsDataURL(files[0]);
            }
        });

        modal4.on('shown.bs.modal', function () {
            cropper4 = new Cropper(image4, {
                aspectRatio: 1,
                viewMode: 2,
                preview: '#preview4'
            });
        }).on('hidden.bs.modal', function () {
            cropper4.destroy();
            cropper4 = null;
        });

        $('#crop4').click(function () {
            canvas = cropper4.getCroppedCanvas({
                width: 200,
                height: 200
            });

            canvas.toBlob(function (blob) {
                url = URL.createObjectURL(blob);
                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                    var base64data = reader.result;
                    modal4.modal('hide');
                    $("#imageValue4").val(base64data)
                    $('#chekPreview4').attr('src', base64data);
                };
            });
        });
        //image 4 and modal 4 end

    });