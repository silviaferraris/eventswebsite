let fileID = 0;
let imagesToUpload = new Map();
let unsaved = false;

let eventTypes;

$(document).click((e) =>
{
    if(!$(e.target).hasClass("sidebar-link"))
    {
        let menus = $(".sidebar-link");
        for(let menu of menus)if(!menu.classList.contains("collapsed"))menu.click();
    }
});

$(document).ready(() =>
{
    $("#container").css('display', 'flex').hide();

    fetch('/events/types').then(async types => eventTypes = await types.json()).catch(e => console.error(e));

    initJS();
});

function initJS()
{
    fileID = 0;
    imagesToUpload = new Map();
    unsaved = false;

    $("[data-toggle=popover]").popover();

    $(".dashboard-form").change(function ()
    {
        unsaved = true;
    });

    $('.popover-dismiss').popover({
        trigger: 'focus'
    });

    $(".count-length-text-area").on('input', function()
    {
        let text = $(this).val();
        let maxlength = $(this).attr('maxlength');
        let label = $(this).parent().find(".length-label");
        if(label)label.text(`${text.length}/${maxlength}`);
    });

    $(".nospace-input").on({
        keydown: function(e)
        {
            if (e.which === 32) return false;
        },
        change: function()
        {
            this.value = this.value.replace(/\s/g, "");
        }
    });

    $(".id-check").on('input', async function()
    {
        let id = $(this).val();
        let api = $(this).attr('data-check-api');
        let validity = $(this).attr('data-validity');
        let response = await fetch(`${api}${id}`);
        if(response.status === 500)return; //TODO Add error handling
        let exist = (await response.json()).exist && id.length !== 0;
        let validId = (validity === 'on-exist' && exist) || (validity === 'on-not-exist' && !exist);
        if(!validId)
        {
            $(this)[0].setCustomValidity("Invalid field.");
            $(this)[0].classList.add("dashboard-invalid-input");
            $(this)[0].classList.remove("dashboard-valid-input");
        }
        else
        {
            $(this)[0].setCustomValidity("");
            $(this)[0].classList.remove("dashboard-invalid-input");
            $(this)[0].classList.add("dashboard-valid-input");
        }
    });

    $(".input-images").change(function ()
    {
        addImages($(this)[0]);
    });

    $(".input-single-image").change(function ()
    {
        let img = $(this)[0].files[0];
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
}

function showAddNewEventForm()
{
    showForm('/admin/dashboard/add_event_form.html');
}

function showAddNewSeminarForm()
{
    showForm('/admin/dashboard/add_seminar_form.html');
}

function showAddNewPerformerForm()
{
    showForm('/admin/dashboard/add_performer_form.html');
}

function showForm(path)
{
    if(unsaved)
    {
        $('#exit-dialog').modal('show');
        let exitBtn = $('#exit-dialog-exit_btn');
        exitBtn.off('click');
        exitBtn.on('click', () =>
        {
            $('#exit-dialog').modal('hide');
            loadForm(path);
        })
    }
    else loadForm(path);
}

function loadForm(path)
{
    $("#container").fadeOut(400, () =>
    {
        $('#container').load(path, () =>
        {
            initJS();
            $("#container").fadeIn(400);
        });
    });
}

async function isValidPerformer(performerId)
{
    let response = await fetch(`/admin/performer/check_id?performer_id=${performerId}`);
    return (await response.json()).exist;
}

async function sendAddEventForm()
{
    let form = document.getElementById("add-event-form");

    let valid = form.checkValidity();
    if(!form.classList.contains('was-validated'))form.classList.add('was-validated');

    let id = $("#input--event-id").val();
    let response = await fetch(`/admin/event/check_id?event_id=${id}`);
    if(response.status === 500)return; //TODO Add error handling
    let validId = !(await response.json()).exist;
    if(!validId)document.getElementById("input--event-id").setCustomValidity("Invalid field.");
    else document.getElementById("input--event-id").setCustomValidity("");

    let performerId = $("#input--event-performer_id").val();
    let validPerformer = await isValidPerformer(performerId);
    if(!validPerformer)document.getElementById("input--event-performer_id").setCustomValidity("Invalid field.");
    else document.getElementById("input--event-performer_id").setCustomValidity("");

    if(!(valid && validId && validPerformer))return;

    let coverImage = await readFileAsync(document.getElementById("input--event-cover-image").files[0]);

    let images = Array.from(imagesToUpload.values());
    let data = {
        id: removeSpace($("#input--event-id").val()),
        title: $("#input--event-title").val(),
        description: $("#input--event-description").val(),
        date: $("#input--event-date").val(),
        event_type: $("#input--event-type").val(),
        performer_id: $("#input--event-performer_id").val(),
        cover_image: coverImage,
        images: images,
        price: $("#input--event-price").val(),
        location: $('#input--event-location').val()
    };
    let options = {
        method: 'post',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    };
    fetch("/admin/event/add_new", options).then(response =>
    {
        if(response.status === 201)
        {
            showSuccessMessage("The event was successfully saved");
            unsaved = false;
            hideForm();
        }
        else if(response.status === 500)showErrorMessage("An internal server error has occurred. Please retry later.")
        else showErrorMessage("An error has occurred. Please retry.");
    });
}

async function sendAddSeminarForm()
{
    let form = document.getElementById("add-seminar-form");

    let valid = form.checkValidity();
    if(!form.classList.contains('was-validated'))form.classList.add('was-validated');

    let id = $("#input--seminar-id").val();
    let response = await fetch(`/admin/seminar/check_id?seminar_id=${id}`);
    if(response.status === 500)return; //TODO Add error handling
    let validId = !(await response.json()).exist;
    if(!validId)document.getElementById("input--seminar-id").setCustomValidity("Invalid field.");
    else document.getElementById("input--seminar-id").setCustomValidity("");

    let performerId = $("#input--seminar-performer_id").val();
    let validPerformer = await isValidPerformer(performerId);
    if(!validPerformer)document.getElementById("input--seminar-performer_id").setCustomValidity("Invalid field.");
    else document.getElementById("input--seminar-performer_id").setCustomValidity("");

    let eventIds = splitIDs($("#input--seminar-event_ids").val());
    let validEventIds = true;
    for(let eventId of eventIds)
    {
        let response = await fetch(`/admin/event/check_id?event_id=${eventId}`);
        if(!(await response.json()).exist)
        {
            validEventIds = false;
            break;
        }
    }
    if(!validEventIds)document.getElementById("input--seminar-event_ids").setCustomValidity("Invalid field.");
    else document.getElementById("input--seminar-event_ids").setCustomValidity("");

    if(!(valid && validId && validPerformer && validEventIds))return;

    let coverImage = await readFileAsync(document.getElementById("input--seminar-cover-image").files[0]);

    let images = Array.from(imagesToUpload.values());
    let data = {
        id: removeSpace($("#input--seminar-id").val()),
        title: $("#input--seminar-title").val(),
        description: $("#input--seminar-description").val(),
        date: $("#input--seminar-date").val(),
        performer_id: $("#input--seminar-performer_id").val(),
        event_ids: splitIDs($("#input--seminar-event_ids").val()),
        cover_image: coverImage,
        images: images,
        location: $('#input--seminar-location').val()
    };
    let options = {
        method: 'post',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    };
    fetch("/admin/seminar/add_new", options).then(response =>
    {
        if(response.status === 201)
        {
            showSuccessMessage("The seminar was successfully saved");
            unsaved = false;
            hideForm();
        }
        else if(response.status === 500)showErrorMessage("An internal server error has occurred. Please retry later.");
        else showErrorMessage("An error has occurred. Please retry.");
    });
}

async function sendAddPerformerForm()
{
    let form = document.getElementById("add-performer-form");

    let valid = form.checkValidity();
    if(!form.classList.contains('was-validated'))form.classList.add('was-validated');

    let id = $("#input--performer-id").val();
    let response = await fetch(`/admin/performer/check_id?performer_id=${id}`);
    if(response.status === 500)return; //TODO Add error handling
    let validId = !(await response.json()).exist;
    if(!validId)document.getElementById("input--performer-id").setCustomValidity("Invalid field.");
    else document.getElementById("input--performer-id").setCustomValidity("");

    if(!(valid && validId))return;

    let photo = await readFileAsync(document.getElementById("input--performer-photo").files[0]);

    let data = {
        id: removeSpace($("#input--performer-id").val()),
        first_name: $("#input--performer-first-name").val(),
        last_name: $("#input--performer-last-name").val(),
        biography: $("#input--performer-biography").val(),
        photo: photo
    };
    let options = {
        method: 'post',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    };
    fetch("/admin/performer/add_new", options).then(response =>
    {
        if(response.status === 201)
        {
            showSuccessMessage("The performer was successfully saved");
            unsaved = false;
            hideForm();
        }
        else if(response.status === 500)showErrorMessage("An internal server error has occurred. Please retry later.")
        else showErrorMessage("An error has occurred. Please retry.");
    });
}

function hideForm()
{
    $("#container").fadeOut(400);
}

function showErrorMessage(message)
{
    let alert = $("#error-alert");
    alert.text(message);
    alert.slideDown(200).delay(2000).slideUp(400);
}

function showSuccessMessage(message)
{
    let alert = $("#success-alert");
    alert.text(message);
    alert.slideDown(200).delay(2000).slideUp(400);
}

function readFileAsync(file)
{
    return new Promise((resolve, reject) =>
    {
        let fileReader = new FileReader();

        fileReader.onload = () =>
        {
            resolve(fileReader.result);
        };

        fileReader.onerror = reject;

        fileReader.readAsDataURL(file);
    });
}

function removeSpace(str)
{
    return str.split(" ").join("");
}

function splitIDs(str)
{
    return removeSpace(str).split(",").map(str => str.trim());
}

function splitTags(str)
{
    if(str.startsWith("#"))str = str.substring(1);
    return str.split("#").map(str =>
    {
        str = removeSpace(str).trim();
        return `#${str}`;
    });
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
