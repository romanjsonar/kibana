import $ from 'jquery';
import html from 'plugins/kibana/discover/components/field_chooser/discover_field.html';
import _ from 'lodash';
import 'ui/directives/css_truncate';
import 'ui/directives/field_name';
import getSort from 'ui/doc_table/lib/get_sort';
import detailsHtml from 'plugins/kibana/discover/components/field_chooser/lib/detail_views/string.html';
import uiModules from 'ui/modules';
const app = uiModules.get('apps/discover');

app.directive('discoverField', function ($compile, collectionAnalyticsModal, Private) {

  return {
    restrict: 'E',
    template: html,
    replace: true,
    scope: {
      field: '=',
      onAddField: '=',
      onAddFilter: '=',
      onRemoveField: '=',
      onShowDetails: '=',
      onShowFullCollectionDetails : '='
    },

    link: function ($scope, $elem) {
      let detailsElem;
      let detailScope;

      const init = function () {
        $scope.searchButtonText = 'Analyze entire collection';
        if ($scope.field.details) {
          $scope.toggleDetails($scope.field, true);
        }
      };

      const SearchSource = Private(require('ui/courier/data_source/search_source'));


      const getWarnings = function (field) {
        let warnings = [];

        if (!field.scripted) {
          if (!field.doc_values && field.type !== 'boolean' && !(field.analyzed && field.type === 'string')) {
            warnings.push('Doc values are not enabled on this field. This may lead to excess heap consumption when visualizing.');
          }

          if (field.analyzed && field.type === 'string') {
            warnings.push('This is an analyzed string field.' +
              ' Analyzed strings are highly unique and can use a lot of memory to visualize.' +
              ' Values such as foo-bar will be broken into foo and bar.');
          }

          if (!field.indexed && !field.searchable) {
            warnings.push('This field is not indexed and might not be usable in visualizations.');
          }
        }


        if (field.scripted) {
          warnings.push('Scripted fields can take a long time to execute.');
        }

        if (warnings.length > 1) {
          warnings = warnings.map(function (warning, i) {
            return (i > 0 ? '\n' : '') + (i + 1) + ' - ' + warning;
          });
        }

        return warnings;

      };

      $scope.toggleDisplay = function (field) {
        if (field.display) {
          $scope.onRemoveField(field.name);
        } else {
          $scope.onAddField(field.name);
        }

        if (field.details) {
          $scope.toggleDetails(field);
        }
      };

      $scope.toggleDetails = function (field, recompute) {
        if (_.isUndefined(field.details) || recompute) {
          $scope.onShowDetails(field, recompute);
          detailScope = $scope.$new();
          detailScope.warnings = getWarnings(field);

          detailsElem = $(detailsHtml);
          $compile(detailsElem)(detailScope);
          $elem.append(detailsElem).addClass('active');
        } else {
          delete field.details;
          detailScope.$destroy();
          detailsElem.remove();
          $elem.removeClass('active');
        }
      };

      function showPopup(field, hits) {
        function doVisualization() {
          //do nothing for now
        }
        const collectionModalOptions = {
          title: 'Full Collection Analytics - ' + field.name,
          confirmButtonText: 'Visualize',
          cancelButtonText: 'Close',
          onConfirm: doVisualization,
          field: field,
          hits: hits
        };
        collectionAnalyticsModal(
          '',
          collectionModalOptions,
        );
      }

      $scope.toggleFullDetails = function (field) {
        $scope.field = field;
        $scope.searchSource = new SearchSource();
        $scope.indexPattern = $scope.$parent.$parent.$parent.searchSource.get('index');
        $scope.searchSource.index($scope.indexPattern);
        $scope.searchSource.query($scope.$parent.$parent.$parent.searchSource.get('query'));
        $scope.searchSource.filter($scope.$parent.$parent.$parent.searchSource.get('filter'));
        $scope.searchSource._state.fieldOnly = 1;
        $scope.sorting = [field.name, 'desc'];
        $scope.searchSource.sort(getSort($scope.sorting, $scope.indexPattern));

        if (!$scope.searchSource) return;
        $scope.searchSource.onResults().then(function onResults(resp) {
          $scope.totalHitCount = resp.hits.total;
          $scope.fetching = 0;
          const field = $scope.onShowFullCollectionDetails($scope.field, resp.hits.hits);
          $scope.visualizationUrl = field.details.visualizeUrl;
          showPopup(field, resp.hits.hits);
        });
        $scope.searchSource.size($scope.$parent.$parent.$parent.hits);

        $scope.fetching = 1;
        $scope.searchSource.fetchQueued();
      };

      init();
    }
  };
});
