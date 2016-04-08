OUTPUT_DIR=output
mkdir -p $OUTPUT_DIR/img/
YENV=production npm run build
cp favicon.ico $OUTPUT_DIR/
