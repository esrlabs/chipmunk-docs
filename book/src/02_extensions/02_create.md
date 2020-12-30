<link rel="stylesheet" type="text/css" href="../styles/styles.extension.css">

# Create a plugin

This section provides a step by step guide on how to get **Chipmunk** and the **Quickstart** repository as well as how to build them.
The repository **Quickstart** provides a variety of plugins which can be copied and modifed to create new plugins.

## Installation of plugins and Chipmunk

First off clone the create a folder for **Chipmunk** and **Quickstart** by typing the following commands:
<pre><code>mkdir chipmunk-developing
cd chipmunk-developing
</code></pre>

After creating the folder, clone both the **Chipmunk** and the **Quickstart** repository into the folder and navigate into it. 

<pre><code>git clone https://github.com/esrlabs/chipmunk.git
git clone https://github.com/esrlabs/chipmunk-quickstart.git
cd chipmunk-quickstart
</code></pre>

The **Quickstart** repository has a few examples of plugins which are located in the folder <code>plugin</code>:
<pre><code>&#9492;&#9472;&#9472; plugins
    &#9500;&#9472;&#9472; plugin.helloworld
    &#9500;&#9472;&#9472; plugin.row.columns
    &#9500;&#9472;&#9472; plugin.row.parser
    &#9500;&#9472;&#9472; plugin.selection.parser
    &#9492;&#9472;&#9472; plugin.sh
</code></pre>

To build the plugin, type the following command with the path to the target plugin:
<pre><code>rake build[./plugins/plugin.helloworld]</code></pre>

Optionally you can define a version of your plugin:
<pre><code>rake build[./plugins/plugin.helloworld, 1.0.1]</code></pre>

>**WINDOWS** Note: To call a rake task with multiple arguments, it could be command should be wrapped as string <code>rake 'build[./plugins/plugin.helloworld, 1.0.1]'</code>

>Note: The very first build always takes some noticeable time because of build script downloads and compiles necessary infrastructure.

As a result the folder <code>releases</code> will be created with the compiled plugin:

<pre><code>&#9500;&#9472;&#9472; plugins
&#9474    &#9500;&#9472;&#9472; plugin.helloworld
&#9474    &#9500;&#9472;&#9472; plugin.row.columns
&#9474    &#9500;&#9472;&#9472; plugin.row.parser
&#9474    &#9500;&#9472;&#9472; plugin.selection.parser
&#9474    &#9492;&#9472;&#9472; plugin.sh
&#9492;&#9472;&#9472; releases
     &#9492;&#9472;&#9472; plugin.helloworld
</code></pre>

To build **Chipmunk** run the following commands to navigate into the folder where the repository was copied:
<pre><code>rake full_pipeline</code></pre>

The building of **Chipmunk** will take some time but only needs to be built once. After the build is finished **Chipmunk** can be executed from the <code>releases</code> folder.


Before starting **Chipmunk** some environment variables need to be passed in as a preparation.


First off define a full path to the folder that will hold the release of your plugin.

<code><pre>export CHIPMUNK_PLUGINS_SANDBOX=../chipmunk-quickstart/releases</pre></code>

By default **Chipmunk** stores plugins the home folder in <code>.chipmunk/plugins</code> but by running the command above it can be modified.


To prevent the installation of default plugins, run the following command

<pre><code>export CHIPMUNK_PLUGINS_NO_DEFAULTS=true</code></pre>


If your has plugin already been published in the **Chipmunk Store** these commands would prevent it from updating:

<pre><code>export CHIPMUNK_PLUGINS_NO_UPGRADE=true
export CHIPMUNK_PLUGINS_NO_UPDATES=true
</code></pre>

To enable logs in the Console making it easier to debug:
<pre><code>export CHIPMUNK_DEV_LOGLEVEL=ENV</code></pre>

Now **Chipmunk** is ready to be executed.

## Rake commands

The following Rake commands are vital for the compilation of **Chipmunk**, which is why in this section the most important rake commands are going to be mentioned and described.

<pre><code>rake start                                          # Start Chipmunk
rake full_pipeline                                  # Build Chipmunk (whole application)
rake build[./plugins/plugin.helloworld]             # Build plugin
rake build[./plugins/plugin.helloworld, 1.0.1]      # Build plugin with version
rake 'build[./plugins/plugin.helloworld, 1.0.1]'    # Build plugin with version (Windows) 
</code></pre>

If a new update of **Chipmunk** is available, first run `rake clobber` (to remove all compiled files) and then `rake full_pipeline` to update and re-build **Chipmunk**.

The next section gives a thorough explanation of the default plugins provided by **Quickstart** 