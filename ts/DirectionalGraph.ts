import * as _ from "lodash";

export class DirectionalGraph {

    static empty<TNode>() : IDirectionalGraph<TNode> {
        return {
            headNodes:[],
            tailNodes:[],
            edges:[]
        };
    }

    static fromEdges<TNode>(edges: Array<Edge<TNode>>): IDirectionalGraph<TNode> {
        return _.reduce<Edge<TNode>, IDirectionalGraph<TNode>>(
            edges,
            DirectionalGraph.withEdge,
            DirectionalGraph.empty<TNode>());
    }

    static withoutNodes<TNode>(graph: IDirectionalGraph<TNode>, nodes: Array<TNode>): IDirectionalGraph<TNode> {
        return _.reduce<TNode, IDirectionalGraph<TNode>>(
            nodes,
            DirectionalGraph.withoutNode,
            graph);
    }

    private static withoutNode<TNode>(
        graph: IDirectionalGraph<TNode>,
        nextNode: TNode):
        IDirectionalGraph<TNode> {
            const edgesToRemoveByFrom = graph.edges
                .filter(edge => edge.from == nextNode);
            const edgesToRemoveByTo = graph.edges
                .filter(edge => edge.to == nextNode);
            const remainingEdges = _.without(
                graph.edges,
                ...edgesToRemoveByFrom,
                ...edgesToRemoveByTo);
            const newTailNodes = edgesToRemoveByTo
                .map(edge => edge.from)
                .filter(node => !remainingEdges.find(value => value.from == node));
            const newHeadNodes = edgesToRemoveByFrom
                .map(edge => edge.to)
                .filter(node => !remainingEdges.find(value => value.to == node));

            return {
                edges: remainingEdges,
                tailNodes: _.without(graph.tailNodes, nextNode).concat(newTailNodes),
                headNodes: _.without(graph.headNodes, nextNode).concat(newHeadNodes)
            };
        }

    private static withEdge<TNode>(
        graph: IDirectionalGraph<TNode>,
        nextEdge: Edge<TNode>):
        IDirectionalGraph<TNode>
    {
        const nextEdges = graph.edges
            .filter(edge => edge.from != nextEdge.from || edge.to != nextEdge.to)
            .concat(nextEdge);

        return {
            edges: nextEdges,
            tailNodes:
                _.without(graph.tailNodes, nextEdge.to)
                .concat(nextEdge.to)
                .filter(node => node !== nextEdge.from)
                .filter(node => !nextEdges.find(edge => node == edge.from)),
            headNodes:
                _.without(graph.headNodes, nextEdge.from)
                .concat(nextEdge.from)
                .filter(node => node !== nextEdge.to)
                .filter(node => !nextEdges.find(edge => node == edge.to))
        };
    }
}

export interface IDirectionalGraph<TNode> {
    headNodes: Array<TNode>;
    tailNodes: Array<TNode>;
    edges: Array<Edge<TNode>>;
}

export interface Edge<T> {
    from: T;
    to: T;
}