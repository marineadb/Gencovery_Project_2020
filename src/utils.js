
// Imports
import { Pathway } from "./Pathway.js";
import { Compound } from "./Compound.js";
import { Reaction } from "./Reaction.js";

/**
 * Parse the JSON object and instanciate the objects
 * 
 * @param  {} json JSON object contains data from the JSON file
 * @return Pathway object which contains the elements
 */
export function parseJSON(json){
    // Patwhay object creation
    var pathway = new Pathway(json.id, "NAME", json.compartments, json.version);
    // Compounds objects creation
    for(var m of json.metabolites){
        var compound = new Compound(m.id, pathway, m.name, m.compartment, m.charge, m.formula);
        if ("coordinates" in m) {
            compound.setCoordinates(m.coordinates.x, m.coordinates.y, m.coordinates.z);
        }
        // Add compound to the patwhay
        pathway.addElement(compound);
    }
    // Reactions objects creation
    for(var r of json.reactions){
        var reaction = new Reaction(r.id, pathway, r.name, r.lower_bound, r.upper_bound, r.subsystem);
        for(var key in r.metabolites){
            var value = r.metabolites[key];
            var data =  {"id" : key,
                         "quantity" : value};
            // If the metabolites is a reagent
            if(value < 0){
                // Add the metabolite to previous element
                reaction.addPreviousElement(data);
                // Put the reaction as new next compound
                putElementToNextElementCompound(pathway, key, reaction.id);
            }
            // If the metabolites is a products
            else{
                // Add the metabolite to next element
                reaction.addNextElement(data);

                // Put the reaction as new previous compound
                putElementToPreviousElementCompound(pathway, key, reaction.id);
            }
        }
        if ("coordinates" in r) {
            compound.setCoordinates(r.coordinates.x, r.coordinates.y, r.coordinates.z);
        }
        // Add compound to the patwhay
        pathway.addElement(reaction);
    }
    
    // for(var g of json.genes){
    //     var gene = new Gene(g.id, g.name);
    //     pathway.addGene(gene);
    // }
    return pathway;
}




/**
 * @param  {} pathway Pathway object which is created during the parsing
 * @param  {} idCompoundToSearch Id of the compound where the reaction id will be added in previous elements
 * @param  {} idElementToAdd Id of the reaction to add
 */
function putElementToPreviousElementCompound(pathway, idCompoundToSearch, idElementToAdd){
    for(var element of pathway.getElements()){
        if(element.getId() == idCompoundToSearch){
            element.addPreviousElement({"id" : idElementToAdd});
        }
    }
}


/**
 * @param  {} patwhay Pathway object which is created during the parsing
 * @param  {} idCompoundToSearch Id of the compound where the reaction id will be added in next elements
 * @param  {} idElementToAdd Id of the reaction to add
 */
function putElementToNextElementCompound(patwhay, idCompoundToSearch, idElementToAdd){
    for(var element of patwhay.getElements()){
        if(element.getId() === idCompoundToSearch){
            element.addNextElement({"id" : idElementToAdd});
        }
    }
}



/**
 * Create the 3D-Force object required to display the graph with the 3D-Force Graph library
 * 
 * @param  {Pathway} pathway Pathway object which contains the data
 * @return {} 3D-Force object which contains nodes and links data
 */
export function create3dForceObject(pathway){
    var nodes_list = [];
    var links_list = [];
    for (var i of pathway.getElements()){ // Pour chaque élément de la liste
        var elem = {};
        elem.id = i.getId();
        elem.name = i.getName();
        var coordinates = i.getCoordinates();
        if ((coordinates.x != 0.0) && (coordinates.y != 0.0) && (coordinates.z != 0.0)) {
            elem.fx = coordinates.x;
            elem.fy = coordinates.y;
            elem.fz = coordinates.z;
        }
        
        if (i instanceof(Reaction)){ // Si c'est une réaction
            // On crée les liens
            for (var j of i.getPreviousElements()){
                var link = {};
                link.source = j.id;
                link.target =  i.getId();
                link.color="red";
                console.log(j.id)
                links_list.push(link); 
            }   
            for (var j of i.getNextElements()){
                var link ={};
                link.source = i.getId();
                link.target = j.id;
                link.color = "blue";
                links_list.push(link); 
            }
            elem.group = 1
        }  
        else{
            elem.group = 2;
        }
        nodes_list.push(elem); // On crée le noeud   
        
    }
        var object={
            nodes : nodes_list,
            links : links_list
        }
        alert(object);
        return object;
}