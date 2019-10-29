import util from './util.mjs'
import Event from "./event.mjs";
import Seminar from "./seminar.mjs";

class Performer
{
    constructor(performerId)
    {
        this._performerId = performerId;
    }

    static getAllPerformers()
    {
        return new Promise((resolve, reject) =>
        {
            util.fetch200(`/performers/all`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Performer));
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
                util.fetch200(`/performers/${this._performerId}/data`).then(async response =>
                {
                    this.data = await response.json();
                    resolve(this.data);
                }).catch(cause => {
                    reject(cause);
                });
            }
        }));
    }

    getEvents()
    {
        return new Promise(((resolve, reject) =>
        {
            util.fetch200(`/events/of_performer?performer_id=${this._performerId}`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Event));
            }).catch(cause => reject(cause));
        }));
    }

    getSeminars()
    {
        return new Promise(((resolve, reject) =>
        {
            util.fetch200(`/seminars/of_performer?performer_id=${this._performerId}`).then(async response =>
            {
                resolve(await util.responseToObjArray(response, Seminar));
            }).catch(cause => reject(cause));
        }));
    }

    get performerId()
    {
        return this._performerId;
    }

    get firstName()
    {
        if(this.data)return this.data.first_name;
    }

    get lastName()
    {
        if(this.data)return this.data.last_name;
    }

    get biography()
    {
        if(this.data)return this.data.biography;
    }

    get photo()
    {
        if(this.data)return this.data.photo;
    }
}

export default Performer;