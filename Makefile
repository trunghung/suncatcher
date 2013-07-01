UNAME:=$(shell uname)

PATH:=$(PATH):./node_modules/.bin:./build/localizr/bin
BUILD:=build

ifeq ($(UNAME), Linux)
ECHO_FLAG=-e
else
ECHO_FLAG=
endif

dust:
	@echo
	@echo $(ECHO_FLAG) "Compiling dust templates"
	@for file in templates/templ/*.html ; do \
		tmp="$${file/templates\/templ/templates/dust}"; \
		out="$${tmp%%.*}.js"; \
		name="$${out##*/}"; name="$${name%%.*}"; \
		dustc --name=$$name $$file $$out ; \
	done \
	
	@echo $(ECHO_FLAG) "Combining dust templates"
	@if test -e templates/dust/templates.js; \
	then rm templates/dust/templates.js; \
	fi
	@for file in templates/dust/*.js ; do \
		cat $$file >> templates/dust/templates.js; \
	done \
