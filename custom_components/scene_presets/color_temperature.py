from homeassistant.util.color import (
    color_RGB_to_xy,
    color_temperature_to_rgb
)

ct_xy_lookup_table = {}
resolution = 50

for temperature in range(2000, 6500 + resolution, resolution):
    rgb = color_temperature_to_rgb(temperature)
    ct_xy_lookup_table[temperature] = color_RGB_to_xy(*rgb)


def find_closest_ct_match(x, y):
    color_temps = list(ct_xy_lookup_table.keys())

    lowest_temp = ct_xy_lookup_table[color_temps[0]]
    highest_temp = ct_xy_lookup_table[color_temps[-1]]

    distance_to_lowest_temp = (x - lowest_temp[0]) ** 2 + (y - lowest_temp[1]) ** 2
    distance_to_highest_temp = (x - highest_temp[0]) ** 2 + (y - highest_temp[1]) ** 2

    if distance_to_lowest_temp < distance_to_highest_temp:
        range_to_iterate = range(0, len(color_temps))
    else:
        range_to_iterate = range(len(color_temps) - 1, -1, -1)

    min_distance = float('inf')
    closest_match = None

    for i in range_to_iterate:
        coord_pair = ct_xy_lookup_table[color_temps[i]]
        x_diff = coord_pair[0] - x
        y_diff = coord_pair[1] - y
        distance = (x_diff ** 2 + y_diff ** 2) ** 0.5

        if distance < min_distance:
            min_distance = distance
            closest_match = color_temps[i]
        else:
            # Break out of the loop if the distance starts increasing
            break

    return closest_match
