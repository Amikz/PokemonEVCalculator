const PARTY_SIZE = 6;
const MAX_WILD = 3;
$(document).ready(function () {
    repeatSection($("#wildPokemon1"), MAX_WILD);
    repeatSection($("#partyPokemon1"), PARTY_SIZE);

    modifyNumPokemon($("#addPartyMember"), $("#removePartyMember"), "#partyPokemon", PARTY_SIZE);
    modifyNumPokemon($("#addWildPokemon"), $("#removeWildPokemon"), "#wildPokemon", MAX_WILD);
});

/**
 * Clones the given section and inserts new hidden copies after it
 *
 * @param {JQuery Object} $id The Object to be cloned
 * @param {number} num The total number of sections (including the original)
 */
function repeatSection($id, num) {
    for (var i = num; i > 1; i--) {
        var $clone = $id.clone().prop("id", $id.prop("id").replace("1", i)).insertAfter($id);
        $clone.find("[id], [name], [for]").each(function () {
            $(this).prop("id", $(this).prop("id").replace("1", i));
            if ($(this).is("[name]")) $(this).attr("name", $(this).attr("name").replace("1", i));
            if ($(this).is("[for]")) $(this).attr("for", $(this).attr("for").replace("1", i));
        });
        $clone.children("legend").text($clone.children("legend").text().replace("1", i));
        $clone.hide();
    }
}

function modifyNumPokemon($add, $remove, pokemon, max) {
    var numPokemon = 1;
    $add.click(function () {
        if (numPokemon < max) {
            numPokemon++;
            $(pokemon + numPokemon).show();

            if (numPokemon == max) $add.attr("disabled", true);
            if (numPokemon > 1) $remove.attr("disabled", false);
        }
    });

    $remove.click(function () {
        if (numPokemon > 1) {
            $(pokemon + numPokemon)
                .find("input[type='number']")
                .each(function () {
                    $(this).val("0");
                });
            $(pokemon + numPokemon)
                .find("select")
                .prop("selectedIndex", 0);
            $(pokemon + numPokemon)
                .find(":checkbox")
                .prop("checked", false);

            $(pokemon + numPokemon).hide();
            numPokemon--;

            if (numPokemon == 1) $remove.attr("disabled", true);
            if (numPokemon < max) $add.attr("disabled", false);
        }
    });
}
