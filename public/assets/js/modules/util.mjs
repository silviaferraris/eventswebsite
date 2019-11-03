function fetch200(input)
{
    return new Promise((resolve, reject) =>
    {
        fetch(input).then(response =>
        {
            if(response.status >= 400) reject(response);
            else resolve(response);
        }).catch(cause => reject(cause));
    });
}

async function responseToObj(response, objType)
{
    let data = await response.json();
    let obj = new objType(data.id);
    obj.data = data;
    return obj;
}

async function responseToObjArray(response, objType)
{
    let dataArray = await response.json();
    let objs = [];

    for(let data of dataArray)
    {
        let obj = new objType(data.id);
        obj.data = data;
        objs.push(obj);
    }
    return objs;
}

export default {fetch200, responseToObj, responseToObjArray}
