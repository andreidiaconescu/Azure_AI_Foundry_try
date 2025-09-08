#!/bin/bash

echo 'Executing file:' $1
node --inspect=0.0.0.0:5840 $1
