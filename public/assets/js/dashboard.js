let fileID = 0;
let imagesToUpload = new Map();

$(document).ready(() =>
{
    $("#input--event-description").on('input', () =>
    {
        let text = $("#input--event-description").val();
        $("#description-length-label").text(`${text.length}/500`);
    });

    $("#input--event-id").on('input', async function()
    {
        let id = $(this).val();
        let response = await fetch(`/admin/check_event_id?event_id=${id}`);
        if(response.status === 500)return; //TODO Add error handling
        let validId = !(await response.json()).exist && id.length !== 0;
        if(!validId)
        {
            document.getElementById("input--event-id").setCustomValidity("Invalid field.");
            document.getElementById("input--event-id").classList.add("dashboard-invalid-input");
            document.getElementById("input--event-id").classList.remove("dashboard-valid-input");
        }
        else
        {
            document.getElementById("input--event-id").setCustomValidity("");
            document.getElementById("input--event-id").classList.remove("dashboard-invalid-input");
            document.getElementById("input--event-id").classList.add("dashboard-valid-input");
        }

    });

    $("#input--event-add-images").change(() =>
    {
        addImages(document.getElementById("input--event-add-images"));
    });

    $("#input--event-cover-image").change(() =>
    {
        let img = document.getElementById("input--event-cover-image").files[0];
        let fileReader = new FileReader();
        fileReader.onload = e =>
        {
            $(".cover-image").attr('src', e.target.result).css('display', 'block');
        };
        fileReader.readAsDataURL(img);
    });

    $(".images-container").on('click', 'div.image-card', function()
    {
        let id = $(this).attr('id');
        imagesToUpload.delete(id.substring(8));
        $(`#${id}`).remove();
    });
});

async function sendAddEventForm()
{
    let form = document.getElementById("add-event-form");

    let valid = form.checkValidity();
    if(!form.classList.contains('was-validated'))form.classList.add('was-validated');

    let id = $("#input--event-id").val();
    let response = await fetch(`/admin/check_event_id?event_id=${id}`);

    if(response.status === 500)return; //TODO Add error handling

    let validId = !(await response.json()).exist;

    if(!validId)document.getElementById("input--event-id").setCustomValidity("Invalid field.");
    else document.getElementById("input--event-id").setCustomValidity("");

    if(valid && validId)
    {
        let images = Array.from(imagesToUpload.values());
        let data = {
            id: $("#input--event-id").val(),
            title: $("#input--event-title").val(),
            description: $("#input--event-description").val(),
            date: $("#input--event-date").val(),
            tags: $("#input--event-tags").val().split(",").map(str => str.trim()),
            performer_id: $("#input--event-performer_id").val(),
            seminar_ids: $("#input--event-seminar_ids").val().split(",").map(str => str.trim()),
            cover_image: document.getElementById("input--event-cover-image").files[0],
            images: images
        };
        let options = {
            method: 'post',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'}
        };
        fetch("/admin/add_new_event", options).then(response =>
        {
           console.log(response.status);
        });
    }
}

function addImages(input)
{
    if (input.files)
    {
        Array.from(input.files).forEach((file) =>
        {
            let fileReader = new FileReader();
            fileReader.onload = e =>
            {
                imagesToUpload.set(`${fileID}`, e.target.result);
                $(".images-container").append(`
                                                            <div class="image-card" id="file-id-${fileID}">
                                                                <img class="input-image" src="${e.target.result}">
                                                                <div class="delete-image-overlay"></div>
                                                            </div>`);
                fileID++;
            };
            fileReader.readAsDataURL(file);
        });
    }
}
