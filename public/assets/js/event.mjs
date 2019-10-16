import util from './util.mjs'
import Seminar from "./seminar.mjs";
import Performer from "./performer.mjs";

class Event
{
    constructor(eventId)
    {
        this._eventId = eventId;
    }

    static getAllEvents()
    {
        return new Promise((resolve, reject) =>
        {
            util.fetch200(`/event/all`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Event));
            }).catch(cause => reject(cause));
        });
    }

    static getEventsOnDate(date)
    {
        return new Promise((resolve, reject) =>
        {
            util.fetch200(`/event/on_date?date=${date}`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Event));
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
                util.fetch200(`/event/by_id?event_id=${this._eventId}`).then(async response =>
                {
                    this.data = await response.json();
                    resolve(this.data);
                }).catch(cause => {
                    reject(cause);
                });
            }
        }));
    };

    getEventsOnSameDate()
    {
        return new Promise(((resolve, reject) =>
        {
            util.fetch200(`/event/on_same_date?event_id=${this._eventId}`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Event));
            }).catch(cause => reject(cause));
        }));
    }

    getSeminars()
    {
        return new Promise(((resolve, reject) =>
        {
            util.fetch200(`/seminar/of_event?event_id=${this._eventId}`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Seminar));
            }).catch(cause => reject(cause));
        }));
    }

    getPerformer()
    {
        return new Promise(((resolve, reject) =>
        {
            util.fetch200(`/performer/of_event?event_id=${this._eventId}`).then(async response =>
            {
                resolve(await util.responseToObj(response, Performer));
            }).catch(cause => reject(cause));
        }));
    }

    get eventId()
    {
        return this._eventId;
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

    get seminarIds()
    {
        if(this.data) return this.data.seminar_ids;
    }

    get tags()
    {
        if(this.data) return this.data.tags;
    }
}

export default Event;