module.exports = function(RED) {
    function Node(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        node.on('input', function(msg) {
            msg.payload = msg.payload + 'foo';
            node.send(msg);
        });
    }
    RED.nodes.registerType("foo", Node);
}
