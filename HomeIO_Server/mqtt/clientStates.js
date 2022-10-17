const allClients = {};

const updateClientState = async (clientId, state) => {
    allClients[clientId] = state;
    console.log(allClients[clientId] ? '[CLIENT ONLINE]' : '[CLIENT OFFLINE]', clientId);
}

const getClientStates = async (clientsToCheck) => {
    let clientStates = {};
    clientsToCheck.forEach(client => {
        if (allClients.hasOwnProperty(client)) {
            clientStates[client] = allClients[client];
        } else {
            clientStates[client] = false;
        }
    });
    return clientStates;
}

exports.updateClientState = updateClientState;

exports.getClientStates = getClientStates;