#!/bin/bash

d_begin=1559438289   
d_end=$(date +%s)
d=$d_begin

while  [ $d_end -ge $d ]; do
  dte="$(date -j -f %s $d +%Y-%m-%d)"
  git checkout `git rev-list -1 --before="$dte" master`
  last_commit_date=`git --no-pager log -1  --format=%cd --date=short`
  serno=`date -j -f %Y-%m-%d $last_commit_date +%Y%m%d`

  echo ""
  echo "====== DATE: $dte [$serno] ======"
  echo ""
  
  yarn && \
    rm -rf dist concat-stats-for .brotli-out && \
    sed -e "s/legacyTargets/mike/g" -i '' ember-cli-build.js && \
    CONCAT_STATS=true ember build --prod && \
    volta pin node@12 && \
    npx ember-asset-size-report@1.2.4 --extra-js-file "assets/i18n/support_en_US.js" --no-build --dataset-name "$dte data" --append-data && \
    # cp module-size-report.csv "../$(git --no-pager log -1  --format=%cd --date=short).csv" && \
    git reset --hard HEAD
  d=$(date -j -f %s -v+14d $d +%s)
done