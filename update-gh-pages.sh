echo -e "Starting to update gh-pages\n"

YENV=production ./build.sh

# IMPORTANT! Create gh-pages branch in your github project first.
# Replace the path to your own github project.
git clone -b gh-pages https://github.com/basilred/lplates.git deploy

cd deploy
rm -rf *
cd ..
rsync -avz --stats output/ deploy/

cd deploy
git add -A
git commit -m "Auto build pushed to gh-pages"
git push origin gh-pages

echo -e "Finishing to update gh-pages\n"
