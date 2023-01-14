
export class Serializable {
    fillFromJSON(json: string) {
        let jsonObj = JSON.parse(json);
        for (let propName in jsonObj) {
            // @ts-ignore
            this[propName] = jsonObj[propName]
        }
    }
}

export class Message extends Serializable {
    type: string | undefined;
    data: string | undefined;

}

export class HandshakeData extends Serializable {
    id: string | undefined;
}

export class InformationalData extends Serializable {
    information: number | undefined;
}