// An event listener to submit button
const form = document.getElementById("uploadForm");
//var fileData = new FileReader();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  var image = document.getElementById("image");

  var reader = new FileReader();
  var hash;
  const formData = new FormData();

  for (let i = 0; i < image.files.length; i++) {
    formData.append("file" + i, image.files[i]);
    console.log(image.files[i]);
  }

  reader.onload = async () => {
    console.log("This is event.js");
    console.log("this is image", image);
    hash = await MD5.generate(reader.result).toString();
    console.log(hash);
    console.log("formdata", formData);
    // Check cache to see if image has been processed
    try {
      console.log(image.files[0].name);
      const imagename = image.files[0].name
      const response = await fetch(`/s3request/store?name=${imagename}&hash=${hash}`, {
        method: "post",
        body: formData,
      });
      let base64 = await response.text();
      console.log(base64);
      
      const base64img = document.createElement("img");
      base64img.src = `data:image/png;base64, ${base64}`;

      document.body.appendChild(base64img);

    } catch (err) {
      console.log(err);
    }
  };
  reader.readAsDataURL(image.files[0]);
});
