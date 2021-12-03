#!/bin/sh -e
set -x

################################################################################
# This program and the accompanying materials are made available under the terms of the
# Eclipse Public License v2.0 which accompanies this distribution, and is available at
# https://www.eclipse.org/legal/epl-v20.html
#
# SPDX-License-Identifier: EPL-2.0
#
# Copyright IBM Corporation 2018, 2020
################################################################################

# npm install on z/OS to get the keyring_js node modules
cd ./content
npm install --production

# Fix package-lock.json encoding
for file in package.json package-lock.json ; do
  encoding=$(ls -T "${file}" | awk '{print $2}')
  if [ "${encoding}" = "ISO8859-1" ]; then
    iconv -f "${encoding}" -t IBM-1047 "${file}.1047"
    mv "${file}.1047" "${file}"
    chtag -r "${file}"
  fi
done
