type listNode = PathNode & {
    startPoint?: {x: number, y: number},
    endPoint?: {x: number, y: number}
}
interface path {
    list: listNode[],
    mirrorX?: boolean,
    mirrorY?: boolean
}
type RenderSettings = PartialRendererSettings & {background: string};