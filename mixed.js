const Graphql = require('graphql');
var seneca = require('seneca')()
var entities = require('seneca-entity')
seneca.use(entities)

seneca.add('cmd:log,system:*,text:*', (msg, reply) => {
    seneca.log.info('logging', msg.text);
    reply(null, {});
});

seneca.add('entity:vehicle,cmd:list,system:*', function (msg, reply) {
    reply(null, {result: [
        {
            name: 'default vehicle',
            system: msg.system
        }
    ]});
});

seneca.add('entity:vehicle,cmd:list,system:*', function (msg, reply) {
    this.prior(msg, reply);
    this.act('cmd:log', {system: msg.system, text: 'vehicle list was called'});
});

seneca.add('entity:vehicle,cmd:list,system:test', function(msg, reply) {
    this.prior(msg, function (err, out) {

        const vehicle = seneca.make('vehicle');
        vehicle.list$( {}, function(err,list){
            reply(null, {
                result: (list.map(function(entry) {
                    entry.system = msg.system;
                    return entry;
                })).concat(out.result)
            });
        });
    });
});

seneca.add('entity:driver,cmd:list,system:test', (msg, reply) => {
    const driver = seneca.make('driver');
    driver.list$( {}, function(err,list){
        reply(null, {
            result: list.map(function(entry) {
                entry.system = msg.system;
                return entry;
            })
        });
    });
});

seneca.add('entity:driver,cmd:create,system:test', (msg, reply) => {
    const driver = seneca.make('driver');
    driver.name = msg.name;

    driver.save$(function(err, entity){
        reply(null, entity);
    })
});

seneca.add('entity:vehicle,cmd:create,system:test', (msg, reply) => {
    const vehicle = seneca.make('vehicle');
    vehicle.name = msg.name;

    vehicle.save$(function(err, entity){
        reply(null, entity);
    })
});

seneca.add('entity:vehicle,cmd:connectDriver,vehicleName:*,driverName:*', (msg, reply) => {
    seneca.make('vehicle').load$({ name: msg.vehicleName}, function(err, vehicle){
        seneca.make('driver').load$({ name: msg.driverName}, function(err, driver){
            vehicle.driverId = driver.id;
            vehicle.save$(function(err, entity){
                reply(null, {
                    vehicleName: entity.name,
                    driverName: driver.name
                });
            })
        })
    })
});

const VehicleType = new Graphql.GraphQLObjectType({
    name: 'Vehicle',
    description: 'This represents a Vehicle',
    fields: () => ({
        name: {
            type: Graphql.GraphQLString,
            resolve: (root, arguments) => {
                return root.name;
            }
        },
        driver: {
            type: new Graphql.GraphQLObjectType({
                name: 'Driver',
                description: 'This represents a Driver',
                fields: () => ({
                    name: {
                        type: Graphql.GraphQLString
                    }
                })
            }),
            resolve: (root, args) => {
                args.system = root.system;

                return new Promise(function (fulfill, reject){
                    seneca.act('entity:driver,cmd:list', args, function (err, result) {
                        if (err) return reject(err);
                        const driver = result
                            .result
                            .find(driver => driver.id === root.driverId);
                        fulfill(driver);
                    })
                });
            }
        }
    })
});

const schemaFactory = function(system) {
    return new Graphql.GraphQLSchema({
        query: new Graphql.GraphQLObjectType({
            name: 'RootQueryType',
            fields: {
                vehicles: {
                    type: new Graphql.GraphQLList(VehicleType),
                    args: {
                        option: {
                            name: 'option',
                            type: Graphql.GraphQLString
                        }
                    },
                    resolve: (root, args) => {
                        args.system = system;

                        return new Promise(function (fulfill, reject){
                            seneca.act('entity:vehicle,cmd:list', args, function (err, result) {
                                if (err) return reject(err);
                                fulfill(result.result);
                            })
                        });
                    }
                }
            }
        }),
        mutation: new Graphql.GraphQLObjectType({
            name: 'RootMutationType',
            fields: {
                addDriver: {
                    type: new Graphql.GraphQLObjectType({
                        name: 'MutationResponse',
                        description: 'This represents a mutation response',
                        fields: () => ({
                            name: {
                                type: Graphql.GraphQLString
                            }
                        })
                    }),
                    args: {
                        name: {
                            name: 'name',
                            type: new Graphql.GraphQLNonNull(Graphql.GraphQLString)
                        }
                    },
                    resolve: (root, args) => {
                        args.system = system;

                        return new Promise(function (fulfill, reject){
                            seneca.act('entity:driver,cmd:create', args, function (err, result) {
                                if (err) return reject(err);
                                fulfill(result);
                            })
                        });
                    }
                },
                addVehicle: {
                    type: new Graphql.GraphQLObjectType({
                        name: 'MutationVehicleResponse',
                        description: 'This represents a mutation response',
                        fields: () => ({
                            name: {
                                type: Graphql.GraphQLString
                            }
                        })
                    }),
                    args: {
                        name: {
                            name: 'name',
                            type: new Graphql.GraphQLNonNull(Graphql.GraphQLString)
                        }
                    },
                    resolve: (root, args) => {
                        args.system = system;

                        return new Promise(function (fulfill, reject){
                            seneca.act('entity:vehicle,cmd:create', args, function (err, result) {
                                if (err) return reject(err);
                                fulfill(result);
                            })
                        });
                    }
                },
                connectDriver: {
                    type: new Graphql.GraphQLObjectType({
                        name: 'ConnectDriverResponse',
                        description: 'This represents a mutation response',
                        fields: () => ({
                            vehicleName: {
                                type: Graphql.GraphQLString
                            },
                            driverName: {
                                type: Graphql.GraphQLString
                            }
                        })
                    }),
                    args: {
                        vehicleName: {
                            vehicleId: 'vehicleName',
                            type: new Graphql.GraphQLNonNull(Graphql.GraphQLString)
                        },
                        driverName: {
                            vehicleId: 'driverName',
                            type: new Graphql.GraphQLNonNull(Graphql.GraphQLString)
                        }
                    },
                    resolve: (root, args) => {
                        args.system = system;

                        return new Promise(function (fulfill, reject){
                            seneca.act('entity:vehicle,cmd:connectDriver', args, function (err, result) {
                                if (err) return reject(err);
                                fulfill(result);
                            })
                        });
                    }
                }
            }
        })
    });
};

Graphql.graphql(schemaFactory('test'), 'mutation { addDriver(name: "joe") { name } }', { }).then((result) => {
    Graphql.graphql(schemaFactory('test'), 'mutation { addVehicle(name: "bus") { name } }', { }).then((result) => {
        Graphql.graphql(schemaFactory('test'), 'mutation { connectDriver(vehicleName: "bus", driverName: "joe") { driverName, vehicleName } }', { }).then((result) => {
            console.log(result.data);
            Graphql.graphql(schemaFactory('test'), '{ vehicles { name, driver { name } } }', { }).then((result) => {
                console.log(result.data.vehicles);
            });
        });
    });
});
