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
            util.fetch200(`/seminars/all`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Seminar));
            }).catch(cause => reject(cause));
        });
    }

    static getNextSeminars(limit)
    {
        return new Promise((resolve, reject) =>
        {
            if(!(/\d+|all/.test(limit)))return reject(new Error("limit format error!"));

            util.fetch200(`/seminars/next_seminars/${limit}`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Seminar));
            }).catch(cause => reject(cause));
        })
    }

    static getSeminarOnDate(date)
    {
        return new Promise((resolve, reject) =>
        {
            util.fetch200(`/seminars/on_date?date=${date}`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Seminar));
            }).catch(cause => reject(cause));
        });
    }

    fetchData(noimages)
    {
        return new Promise(((resolve, reject) =>
        {
            if(this.data)resolve(this.data);
            else
            {
                if(!noimages)noimages = 'false';
                util.fetch200(`/seminars/${this._seminarId}/data?noimages=${noimages}`).then(async response =>
                {
                    this.data = await response.json();
                    resolve(this.data);
                }).catch(cause => {
                    reject(cause);
                });
            }
        }));
    }

    retrieveCoverImage()
    {
        return new Promise((resolve, reject) =>
        {
            if(this.data && this.data.cover_image)resolve(this.data.cover_image);
            else
            {
                util.fetch200(`/seminars/${this._seminarId}/cover_image`).then(async response => {
                    resolve((await response.json()).cover_image);
                }).catch(cause => reject(cause));
            }
        });
    }

    getImages(range)
    {
        return new Promise((resolve, reject) =>
        {
            if(!/\d+-\d+|all/.test(range))return reject(new Error("range format error!"));

            util.fetch200(`/seminars/${this._seminarId}/images/${range}`).then(async response =>
            {
                resolve(await response.json());
            }).catch(cause => reject(cause));
        });
    }

    getSeminarsOnSameDate()
    {
        return new Promise(((resolve, reject) =>
        {
            util.fetch200(`/seminars/${this._seminarId}/on_same_date`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Seminar));
            }).catch(cause => reject(cause));
        }));
    }

    getEvents()
    {
        return new Promise(((resolve, reject) =>
        {
            util.fetch200(`/events/of_seminar?seminar_id=${this._seminarId}`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Event));
            }).catch(cause => reject(cause));
        }));
    }

    getPerformer()
    {
        return new Promise(((resolve, reject) =>
        {
            util.fetch200(`/performers/of_seminar?seminar_id=${this._seminarId}`).then(async response =>
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

    get performerFirstName()
    {
        if(this.data)return this.data.performer_first_name;
    }

    get performerLastName()
    {
        if(this.data)return this.data.performer_last_name;
    }

    get date()
    {
        if(this.data) return new Date(this.data.date);
    }

    get coverImage()
    {
        if(this.data) return this.data.cover_image;
    }

    get imagesNumber()
    {
        if(this.data) return this.data.images_number;
    }

    get location()
    {
        if(this.data) return this.data.location;
    }
}

export default Seminar;