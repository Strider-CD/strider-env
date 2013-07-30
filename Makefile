JADE = $(shell find templates/*.jade)
HTML = $(JADE:.jade=.html)

all: $(HTML)

%.html: %.jade
	jade -P < $< --path $< > $@

clean:
	rm -f $(HTML)

.PHONY: clean
