export interface Message {
    type: string | undefined;
    websocketId?: string;
    data: any | undefined;

}