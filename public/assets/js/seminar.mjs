import util from './util.mjs'
import Event from "./event.mjs";
import Performer from "./performer.mjs";

class Seminar
{
    constructor(seminarId)
    {
        this._seminarId = seminarId;
    }

    static getAllSeminars()
    {
        return new Promise((resolve, reject) =>
        {
            util.fetch200(`/seminar/all`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Seminar));
            }).catch(cause => reject(cause));
        });
    }

    static getSeminarOnDate(date)
    {
        return new Promise((resolve, reject) =>
        {
            util.fetch200(`/seminar/on_date?date=${date}`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Seminar));
            }).catch(cause => reject(cause));
        });
    }

    fetchData()
    {
        return new Promise(((resolve, reject) =>
        {
            if(this.data)resolve(this.data);
            else
            {
                util.fetch200(`/seminar/by_id?seminar_id=${this._seminarId}`).then(async response =>
                {
                    this.data = await response.json();
                    resolve(this.data);
                }).catch(cause => {
                    reject(cause);
                });
            }
        }));
    }


    getSeminarsOnSameDate()
    {
        return new Promise(((resolve, reject) =>
        {
            util.fetch200(`/seminar/on_same_date?seminar_id=${this._seminarId}`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Seminar));
            }).catch(cause => reject(cause));
        }));
    }

    getEvents()
    {
        return new Promise(((resolve, reject) =>
        {
            util.fetch200(`/event/of_seminar?seminar_id=${this._seminarId}`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Event));
            }).catch(cause => reject(cause));
        }));
    }

    getPerformer()
    {
        return new Promise(((resolve, reject) =>
        {
            util.fetch200(`/performer/of_seminar?seminar_id=${this._seminarId}`).then(async response =>
            {
                resolve(await util.responseToObj(response, Performer));
            }).catch(cause => reject(cause));
        }));
    }

    get seminarId()
    {
        return this._seminarId;
    }

    get title()
    {
        if(this.data)return this.data.title;
    }

    get description()
    {
        if(this.data)return this.data.description;
    }

    get performerId()
    {
        if(this.data)return this.data.performer_id;
    }

    get date()
    {
        if(this.data) return new Date(this.data.date);
    }

    get hasCoverImage()
    {
        if(this.data) return this.data.has_cover_image;
    }

    get imagesNumber()
    {
        if(this.data) return this.data.images_number;
    }

    get eventIds()
    {
        if(this.data) return this.data.event_ids;
    }
}

export default Seminar;