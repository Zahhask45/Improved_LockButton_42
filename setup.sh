#/bin/sh

python3 zipit.py

gnome-extensions install lockscreen@jodos-sa.com.zip

rm -rf lockscreen@jodos-sa.com.zip

killall -3 gnome-shell #unsafe approach to restart the gnome-shell

gnome-extensions enable lockscreen@jodos-sa.com.zip
