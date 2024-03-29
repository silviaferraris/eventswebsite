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
            util.fetch200(`/events/all`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Event));
            }).catch(cause => reject(cause));
        });
    }

    static getNextEvents(limit, offset, typesArray, noimages)
    {
        return new Promise((resolve, reject) =>
        {
            if(!(/\d+|all/.test(limit)))return reject(new Error("limit format error!"));

            let range;
            if(typeof offset == 'undefined') range = `0-${limit}`;
            else
            {
                if(!/\d+/.test(offset))return reject(new Error("offset must be an integer!"));
                range = `${offset}-${limit}`
            }

            let types = '';
            if(typeof typesArray != 'undefined')
            {
                if(typesArray.length === 0)types = 'none';
                else
                {
                    typesArray.forEach(type => types += `${type},`);
                    types = types.substring(0, types.length-1);
                }
            }

            if(!noimages)noimages = 'false';

            util.fetch200(`/events/next_events/${range}?types=${types}&noimages=${noimages}`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Event));
            }).catch(cause => reject(cause));
        })
    }

    static getEventsOnDate(date)
    {
        return new Promise((resolve, reject) =>
        {
            util.fetch200(`/events/on_date?date=${date}`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Event));
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
                util.fetch200(`/events/${this._eventId}/data?noimages=${noimages}`).then(async response =>
                {
                    this.data = await response.json();
                    resolve(this.data);
                }).catch(cause => {
                    reject(cause);
                });
            }
        }));
    };

    getImages(range)
    {
        return new Promise((resolve, reject) =>
        {
            if(!/\d+-\d+|all/.test(range))return reject(new Error("range format error!"));

            util.fetch200(`/events/${this._eventId}/images/${range}`).then(async response =>
            {
                resolve(await response.json());
            }).catch(cause => reject(cause));
        });
    }

    retrieveCoverImage()
    {
        return new Promise((resolve, reject) =>
        {
            if(this.data && this.data.cover_image)resolve(this.data.cover_image);
            else
            {
                util.fetch200(`/events/${this._eventId}/cover_image`).then(async response => {
                    resolve((await response.json()).cover_image);
                }).catch(cause => reject(cause));
            }
        });
    }

    getEventsOnSameDate()
    {
        return new Promise(((resolve, reject) =>
        {
            util.fetch200(`/events/${this._eventId}/on_same_date`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Event));
            }).catch(cause => reject(cause));
        }));
    }

    getSeminars()
    {
        return new Promise(((resolve, reject) =>
        {
            util.fetch200(`/seminars/of_event?event_id=${this._eventId}`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Seminar));
            }).catch(cause => reject(cause));
        }));
    }

    getPerformer()
    {
        return new Promise(((resolve, reject) =>
        {
            util.fetch200(`/performers/of_event?event_id=${this._eventId}`).then(async response =>
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

    get coverImage()
    {
        if(this.data)return this.data.cover_image;
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

    get imagesNumber()
    {
        if(this.data) return this.data.images_number;
    }

    get price()
    {
        if(this.data) return this.data.price;
    }

    get location()
    {
        if(this.data) return this.data.location;
    }

    get type()
    {
        if(this.data) return this.data.type;
    }
}

export default Event;