'use strict';
var LAHMA = LAHMA || { // use global LAHMA as a namespace, window.LAHMA = window.LAHMA || {}; would also work. In both cases it is attached to the window object.
    siteurl: null, // Declaration without assignmet is not allowed here, consequently we use null.
    dbsearch_ajax: null,
    chains: null,
};

$(document).ready(function() {
    if ($('#first-div').data('title') === 'main_lahma_application') {
        LAHMA.siteurl = window.location.origin;
        LAHMA.chains = '';

        $('[data-toggle="tooltip"]').tooltip({ html: true, trigger: 'hover' });


        $('#pdb-id').on('keyup', function(e) {
            if (e.keyCode == 13) {
                //window.location.search = '?&pdb_id=' + $('#pdb-id').val().trim();
                $('#pdbid-searchbtn').click();
            }
        });
    }
    if ($('#first-div').data('title') === 'pdbscript_status_page') {
        update_status(task_uuid);
    }
    if ($('#first-div').data('title') === 'pdbscript_results_page') {
        show_results(display_objects, ncs, warnings, num_homologs);
    }
});


function get_annotations() {
    var pdb_id = $('#pdb-id').val();
    pdb_id = pdb_id.trim(); // whitespace removal
    var curr_length = 0;
    var indexes_string = '';
    var i, j;
    var AAseq_span = '';
    LAHMA.chains = '';

    if (validate_search_database_id(pdb_id) === false) { return false; }

    clear_all();
    hide_byclass('section1');

    // initialize and reset
    //initialize_reset();

    $('.pdb-search-progress-bar').css('display', 'inline');
    LAHMA.dbsearch_ajax = $.ajax({
        type: 'GET',
        url: LAHMA.siteurl + '/search_database/' + pdb_id,
        async: true,
        success: function(response) {
            clear_pdb_search(); // used to hide progress bar

            //console.log(response);
            response = $.parseJSON(response);
            if (response.error) {
                clear_all();
                hide_byclass('section1');
                $('#pdb-id-search-alerts').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">×</a>' +
                    '<span>' + response.error + '</span></div>');
                return false;
            }
            var display_objects = response[0];
            var ncs = response[1];
            var warnings = response[2];
            var num_homologs = response[3];

            var last_element = document.getElementById('first-div');

            for (i = 0; i < display_objects.length; i += 1) {
                var display_object = display_objects[i];
                var chain_id = display_object["ChainID"];
                LAHMA.chains += chain_id;
                var inorout = '';
                var rest_header_text = ' (' + num_homologs[i] + ' homologous chains';
                for (j = 0; j < ncs.length; j += 1) {
                    if (chain_id == ncs[j][0]) {
                        inorout = 'in';
                        break;
                    } else if (ncs[j][1].indexOf(chain_id) > -1) {
                        rest_header_text += ", NCS copy of chain " + ncs[j][0];
                        break;
                    }
                }
                rest_header_text += ')';

                var card =
                    `
<!--Card-->
<div class="card section1 panel-group panel" id='chain` + chain_id + `'>
    <!--Title-->
    <div class="panel-heading">
        <h4 class="panel-title">
            <a data-toggle="collapse" data-parent="#" href="#predictions-panel` + chain_id + `">
                <span class="black-font">Chain ` + chain_id + rest_header_text + ` </span>
            </a>
        </h4>
    </div>
    <!--Card content-->
    <div class="card-block panel-collapse collapse ` + inorout + `" id="predictions-panel` + chain_id + `">
        <!--Text-->
        <table class="pred-panel">
            <tr>
                <td style="width: 170px; vertical-align: top;"><div class="pred-labels" id="sequences-labels` + chain_id + `" data-placement="right"></div></td>
                <td style="width: 25px; vertical-align: top;"><div class="pred-explain" id="sequences-explain` + chain_id + `" data-placement="right"></div></td>
<!--
                <td style="vertical-align: top;"><div class="pred-viewer" id="sequences-viewer` + chain_id + `" onscroll="$('#aa-viewer` + chain_id + `').scrollLeft($(this).scrollLeft());"></div></td>
-->
                <td style="vertical-align: top;">
                  <div class="pred-viewer">
                    <table id="sequences-viewer` + chain_id + `">
                    </table>
                  </div>
                </td>
            </tr>
        </table>
    </div>
    <!--/.Card content-->
</div>
<!--/.Card-->
`
                AAseq_span = '';
                last_element.outerHTML += card;
                $('#pdb-id').val(pdb_id); // ! otherwise the value is getting lost because it is not part of the initial HTML that loaded ! all events are getting detached
                $('#pdb-id').on('keyup', function(e) {
                    if (e.keyCode == 13) {
                        $('#pdbid-searchbtn').click();
                    }
                });


                last_element = document.getElementById('chain' + chain_id);

                $('#aa-viewer' + chain_id).css('overflow', 'hidden'); // to hide the scroll bar
                //                // scroll synchronization of aa-viewer, their bars will be hidden on success
                //                $('#sequences-viewer' + chain_id).on('scroll', function () {
                //                    $('#aa-viewer' + chain_id).scrollLeft($(this).scrollLeft());
                //                });                

                draw_annotations('#sequences-labels' + chain_id, '#sequences-viewer' + chain_id,
                    '#sequences-explain' + chain_id, display_object, chain_id);
            }
            $('.collapse.in').prev('.panel-heading').addClass('active');
            $('#bs-collapse')
                .on('show.bs.collapse', function(a) {
                    $(a.target).prev('.panel-heading').addClass('active');
                })
                .on('hide.bs.collapse', function(a) {
                    $(a.target).prev('.panel-heading').removeClass('active');
                });
        },
        error: function(jqXHR, exception) {
            clear_pdb_search(); // used to hide progress bar
            if (exception === 'abort') {

            } else {
                $('#pdb-id-search-alerts').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">×</a>' +
                    '<span>Communication problem with LAHMA server.<br>Please try again or reload the page.</span></div>');
            }
        }
    });
}


function onclickAA(ev) {
    // demo
}

function onMouseOverAA(ev) {
    var chain_id = ev.target.id;
    var idx = ev.target.cellIndex;
    $("#sequences-viewer" + chain_id).find('td').removeClass('selected');
    $("#sequences-viewer" + chain_id).find('tr').each(function() {
        $(this).find('td').eq(idx).addClass('selected');
    });
}

function onMouseOutAA(ev) {
    var chain_id = ev.target.id;
    var idx = ev.target.cellIndex;
    //    $("#sequences-viewer" + chain_id).find('td').removeClass('selected');
}

function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}