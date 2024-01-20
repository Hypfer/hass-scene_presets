from homeassistant.util.color import (
    color_RGB_to_xy,
    color_temperature_to_rgb
)

ct_xy_lookup_table = {}
resolution = 100

for temperature in range(2000, 6500 + resolution, resolution):
    rgb = color_temperature_to_rgb(temperature)
    ct_xy_lookup_table[temperature] = color_RGB_to_xy(*rgb)


def find_closest_ct_match(x, y):
    min_distance = float('inf')
    closest_match = None

    for number, coord_pair in ct_xy_lookup_table.items():
        x_diff = coord_pair[0] - x
        y_diff = coord_pair[1] - y
        distance = (x_diff**2 + y_diff**2)**0.5

        if distance < min_distance:
            min_distance = distance
            closest_match = number

    return closest_match
